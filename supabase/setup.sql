-- ============================================================
-- 流浪星球 · 双人/共赴轨道 · Supabase 数据库结构
-- 用法：Supabase 控制台 → SQL Editor → 整段粘贴执行
-- ============================================================

-- ---------- 表 ----------

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  creator uuid not null,                      -- 邀请者 auth.uid()
  status text not null default 'pending',     -- pending | accepted | cancelled
  galaxy_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.galaxies (
  id uuid primary key default gen_random_uuid(),
  member_a uuid not null,
  member_b uuid not null,
  status text not null default 'active',      -- active | dimmed
  created_at timestamptz not null default now(),
  dimmed_at timestamptz,
  dimmed_by uuid
);

create table if not exists public.shared_stars (
  id uuid primary key default gen_random_uuid(),
  galaxy_id uuid not null references public.galaxies(id) on delete cascade,
  seq int not null,                           -- 点亮顺序 1..3
  name text not null,
  energy numeric not null default 0,
  required numeric not null default 450,
  lit_at timestamptz
);

create table if not exists public.shared_orbits (
  id uuid primary key default gen_random_uuid(),
  galaxy_id uuid not null references public.galaxies(id) on delete cascade,
  star_id uuid not null references public.shared_stars(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  last_heartbeat timestamptz not null default now(),
  a_active boolean not null default false,
  b_active boolean not null default false,
  both_seconds numeric not null default 0,    -- 双方同时在线的秒数（×1.5 加成）
  solo_seconds numeric not null default 0,    -- 仅一方在线的秒数
  base_star_energy numeric not null default 0 -- 会话开始时星的能量（幂等重算用）
);

create table if not exists public.shared_entries (
  id uuid primary key default gen_random_uuid(),
  galaxy_id uuid not null references public.galaxies(id) on delete cascade,
  star_id uuid not null references public.shared_stars(id) on delete cascade,
  author uuid not null,
  type text not null,                         -- text | voice | image
  text_content text,
  media_data text,                            -- base64（MVP；将来换对象存储）
  created_at timestamptz not null default now()
);

create table if not exists public.presence (
  user_id uuid primary key references auth.users(id) on delete cascade,
  galaxy_id uuid,
  last_seen timestamptz not null default now()
);

-- ---------- 能量常量与 RPC ----------

-- 共赴表达的能量值（与单人一致；双人时间加成在心跳里算）
create or replace function public.pair_energy(entry_type text default null)
returns numeric language sql immutable as $$
  select case entry_type
    when 'text' then 60
    when 'voice' then 180
    when 'image' then 30
    else 0
  end
$$;

-- 心跳 + 能量结算：每次调用把"上次心跳至今"的时长归入 both/solo 桶，
-- 并幂等重算目标星能量；双方都离开 → 会话结束并结算。
create or replace function public.shared_orbit_heartbeat(p_session uuid, p_active boolean)
returns void language plpgsql security definer as $$
declare
  r record;
  dt numeric;
  new_energy numeric;
begin
  select * into r from public.shared_orbits
    where id = p_session and ended_at is null
    for update;
  if r is null then return; end if;

  dt := greatest(least(extract(epoch from (now() - r.last_heartbeat)), 120), 0);

  if auth.uid() = (select g.member_a from public.galaxies g where g.id = r.galaxy_id) then
    r.a_active := p_active;
  else
    r.b_active := p_active;
  end if;

  if r.a_active and r.b_active then
    r.both_seconds := r.both_seconds + dt;
  elsif r.a_active or r.b_active then
    r.solo_seconds := r.solo_seconds + dt;
  end if;

  r.last_heartbeat := now();

  new_energy := greatest(
    r.base_star_energy + r.both_seconds * 1.5 + r.solo_seconds +
      (select coalesce(sum(public.pair_energy(e.type)), 0) from public.shared_entries e
        where e.star_id = r.star_id and e.created_at >= r.started_at),
    r.base_star_energy
  );

  update public.shared_stars
    set energy = new_energy,
        lit_at = coalesce(lit_at, case when new_energy >= required then now() else null end)
    where id = r.star_id;

  if not r.a_active and not r.b_active then
    r.ended_at := now();
  end if;

  update public.shared_orbits set
    a_active = r.a_active, b_active = r.b_active,
    both_seconds = r.both_seconds, solo_seconds = r.solo_seconds,
    last_heartbeat = r.last_heartbeat, ended_at = r.ended_at
  where id = r.id;
end;
$$;

-- 创建信标：返回 6 位邀请码
create or replace function public.create_invite()
returns text language plpgsql security definer as $$
declare
  c text;
begin
  loop
    c := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (select 1 from public.invites where code = c and status = 'pending');
  end loop;
  insert into public.invites (code, creator) values (c, auth.uid());
  return c;
end;
$$;

-- 循光而来：接受邀请 → 创建共赴星系 + 三颗共赴星（启明/长庚/比邻）
create or replace function public.accept_invite(p_code text)
returns uuid language plpgsql security definer as $$
declare
  inv record;
  gid uuid;
begin
  select * into inv from public.invites
    where code = upper(p_code) and status = 'pending'
    for update;
  if inv is null or inv.creator = auth.uid() then return null; end if;

  -- 已有 active 星系则直接返回（不重复建）
  select id into gid from public.galaxies
    where status = 'active'
      and ((member_a = inv.creator and member_b = auth.uid())
        or (member_b = inv.creator and member_a = auth.uid()))
    limit 1;

  if gid is null then
    insert into public.galaxies (member_a, member_b)
      values (inv.creator, auth.uid()) returning id into gid;
    insert into public.shared_stars (galaxy_id, seq, name, required) values
      (gid, 1, '启明', 450),
      (gid, 2, '长庚', 450),
      (gid, 3, '比邻', 450);
  end if;

  update public.invites set status = 'accepted', galaxy_id = gid where id = inv.id;
  return gid;
end;
$$;

-- 开始共赴在轨（有进行中的会话则复用）
create or replace function public.shared_orbit_start(p_galaxy uuid, p_star uuid)
returns uuid language plpgsql security definer as $$
declare
  sid uuid;
begin
  select id into sid from public.shared_orbits
    where galaxy_id = p_galaxy and ended_at is null limit 1;
  if sid is null then
    insert into public.shared_orbits (galaxy_id, star_id, base_star_energy)
      values (p_galaxy, p_star,
        coalesce((select energy from public.shared_stars where id = p_star), 0))
      returning id into sid;
  end if;
  return sid;
end;
$$;

-- 互发表达（能量在心跳里累计）
create or replace function public.add_shared_entry(p_galaxy uuid, p_star uuid, p_type text, p_text text default null, p_media text default null)
returns uuid language plpgsql security definer as $$
declare
  eid uuid;
begin
  insert into public.shared_entries (galaxy_id, star_id, author, type, text_content, media_data)
  values (p_galaxy, p_star, auth.uid(), p_type, p_text, p_media)
  returning id into eid;
  return eid;
end;
$$;

-- 黯淡 / 复明 / 彻底删除
create or replace function public.set_galaxy_status(p_galaxy uuid, p_status text)
returns void language plpgsql security definer as $$
begin
  if p_status = 'dimmed' then
    update public.galaxies set status = 'dimmed', dimmed_at = now(), dimmed_by = auth.uid()
      where id = p_galaxy;
  elsif p_status = 'active' then
    update public.galaxies set status = 'active', dimmed_at = null, dimmed_by = null
      where id = p_galaxy;
  elsif p_status = 'deleted' then
    delete from public.galaxies where id = p_galaxy;
  end if;
end;
$$;

-- 在场心跳（每 ~8 秒）
create or replace function public.heartbeat_presence(p_galaxy uuid default null)
returns void language sql security definer as $$
  insert into public.presence (user_id, galaxy_id, last_seen)
  values (auth.uid(), p_galaxy, now())
  on conflict (user_id) do update
    set galaxy_id = coalesce(excluded.galaxy_id, presence.galaxy_id),
        last_seen = now()
$$;

-- 清理并结算久无人心跳的会话（双方都离线 90 秒后，由下次访问的任一方触发）
create or replace function public.settle_stale_orbits()
returns void language plpgsql security definer as $$
declare
  r record;
  new_energy numeric;
begin
  for r in select * from public.shared_orbits
    where ended_at is null and last_heartbeat < now() - interval '90 seconds'
  loop
    new_energy := greatest(
      r.base_star_energy + r.both_seconds * 1.5 + r.solo_seconds +
        (select coalesce(sum(public.pair_energy(e.type)), 0) from public.shared_entries e
          where e.star_id = r.star_id and e.created_at >= r.started_at),
      r.base_star_energy
    );
    update public.shared_stars
      set energy = new_energy,
          lit_at = coalesce(lit_at, case when new_energy >= required then now() else null end)
      where id = r.star_id;
    update public.shared_orbits set ended_at = now() where id = r.id;
  end loop;
end;
$$;

-- ---------- 行级权限（写操作全部走上面的 security definer RPC；读走策略） ----------
-- 全部先删后建，脚本可重复执行

alter table public.invites enable row level security;
alter table public.galaxies enable row level security;
alter table public.shared_stars enable row level security;
alter table public.shared_orbits enable row level security;
alter table public.shared_entries enable row level security;
alter table public.presence enable row level security;

drop policy if exists "invites_read_creator" on public.invites;
drop policy if exists "galaxies_read_members" on public.galaxies;
drop policy if exists "stars_read_members" on public.shared_stars;
drop policy if exists "orbits_read_members" on public.shared_orbits;
drop policy if exists "entries_read_members" on public.shared_entries;
drop policy if exists "presence_read_all" on public.presence;

create policy "invites_read_creator" on public.invites
  for select using (creator = auth.uid());

create policy "galaxies_read_members" on public.galaxies
  for select using (member_a = auth.uid() or member_b = auth.uid());

create policy "stars_read_members" on public.shared_stars
  for select using (
    exists (select 1 from public.galaxies g
      where g.id = galaxy_id and (g.member_a = auth.uid() or g.member_b = auth.uid()))
  );

create policy "orbits_read_members" on public.shared_orbits
  for select using (
    exists (select 1 from public.galaxies g
      where g.id = galaxy_id and (g.member_a = auth.uid() or g.member_b = auth.uid()))
  );

create policy "entries_read_members" on public.shared_entries
  for select using (
    exists (select 1 from public.galaxies g
      where g.id = galaxy_id and (g.member_a = auth.uid() or g.member_b = auth.uid()))
  );

create policy "presence_read_all" on public.presence
  for select using (true);

-- ---------- 实时订阅（Realtime，幂等） ----------

do $$
begin
  begin alter publication supabase_realtime add table public.invites; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.galaxies; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.shared_stars; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.shared_orbits; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.shared_entries; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.presence; exception when duplicate_object then null; end;
end $$;
