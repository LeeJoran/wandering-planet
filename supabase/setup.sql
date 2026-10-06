-- ============================================================
-- 流浪星球 · 双人/共赴轨道 · Supabase 数据库结构
-- 用法：Supabase 控制台 → SQL Editor → 整段粘贴执行（幂等，可重复执行）
-- v4：多成员共赴（2-5 人）、信标容量与目标、成员称呼、长期入口邀请码
-- ============================================================

-- ---------- 表 ----------

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  creator uuid not null,                      -- 邀请者 auth.uid()
  status text not null default 'pending',     -- pending | accepted | cancelled
  galaxy_id uuid,                             -- null=开启新共赴；否则=邀请加入该共赴（已接受后是长期入口）
  capacity int not null default 2,            -- 新共赴的人数上限（2-5）
  creator_nickname text not null default '',  -- 邀请者给自己取的称呼（3+ 人共赴用）
  created_at timestamptz not null default now()
);

-- 旧 invites 表补新列（可重复跑）
alter table public.invites add column if not exists capacity int;
alter table public.invites add column if not exists creator_nickname text;
update public.invites set capacity = 2 where capacity is null;
update public.invites set creator_nickname = '' where creator_nickname is null;

create table if not exists public.galaxies (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'active',      -- active | dimmed
  capacity int not null default 2,            -- 人数上限 2-5
  created_at timestamptz not null default now(),
  dimmed_at timestamptz,
  dimmed_by uuid
);

create table if not exists public.galaxy_members (
  galaxy_id uuid not null references public.galaxies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null default '',          -- 自取称呼（空 = 前端按加入顺序叫成员N）
  joined_at timestamptz not null default now(),
  primary key (galaxy_id, user_id)
);

-- 旧版（双人 member_a/member_b）→ 多成员迁移（旧列存在才执行，可重复跑）
-- 先删掉引用旧列的旧策略（后面 RLS 段会重建新策略）
drop policy if exists "galaxies_read_members" on public.galaxies;
drop policy if exists "stars_read_members" on public.shared_stars;
drop policy if exists "orbits_read_members" on public.shared_orbits;
drop policy if exists "entries_read_members" on public.shared_entries;
do $$
begin
  if exists (select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'galaxies' and column_name = 'member_a') then
    insert into public.galaxy_members (galaxy_id, user_id, joined_at)
      select id, member_a, created_at from public.galaxies where member_a is not null
    on conflict do nothing;
    insert into public.galaxy_members (galaxy_id, user_id, joined_at)
      select id, member_b, created_at from public.galaxies where member_b is not null
    on conflict do nothing;
    alter table public.galaxies drop column member_a;
    alter table public.galaxies drop column member_b;
  end if;
end $$;
alter table public.galaxies add column if not exists capacity int;
update public.galaxies set capacity = 2 where capacity is null or capacity < 2;

create table if not exists public.shared_stars (
  id uuid primary key default gen_random_uuid(),
  galaxy_id uuid not null references public.galaxies(id) on delete cascade,
  constellation_id text not null default '',  -- 星座 id（内容在前端数据里）
  star_id text not null default '',           -- 星座内恒星 id
  energy numeric not null default 0,
  required numeric not null default 300,
  lit_at timestamptz
);

-- 旧版（固定三颗共赴星）→ 星座体系迁移
alter table public.shared_stars drop column if exists seq;
alter table public.shared_stars drop column if exists name;
alter table public.shared_stars add column if not exists constellation_id text;
alter table public.shared_stars add column if not exists star_id text;
update public.shared_stars set constellation_id = '' where constellation_id is null;
update public.shared_stars set star_id = '' where star_id is null;
delete from public.shared_stars where constellation_id = '';
create unique index if not exists shared_stars_uniq
  on public.shared_stars (galaxy_id, constellation_id, star_id)
  where constellation_id <> '';

create table if not exists public.shared_orbits (
  id uuid primary key default gen_random_uuid(),
  galaxy_id uuid not null references public.galaxies(id) on delete cascade,
  star_id uuid not null references public.shared_stars(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  last_heartbeat timestamptz not null default now(),
  active_members uuid[] not null default '{}', -- 在轨成员 user_id 列表
  member_count int not null default 2,         -- 会话开始时成员总数（全员加成倍率用）
  both_seconds numeric not null default 0,     -- 全员同时在线的秒数（× 倍率加成）
  solo_seconds numeric not null default 0,     -- 仅部分成员在线的秒数
  base_star_energy numeric not null default 0  -- 会话开始时星的能量（幂等重算用）
);

-- 旧版双人 a_active/b_active → active_members 迁移
alter table public.shared_orbits drop column if exists a_active;
alter table public.shared_orbits drop column if exists b_active;
alter table public.shared_orbits add column if not exists active_members uuid[];
alter table public.shared_orbits add column if not exists member_count int;
update public.shared_orbits set active_members = '{}' where active_members is null;
update public.shared_orbits set member_count = 2 where member_count is null;

-- 同一星系只允许一条进行中的会话（顺延切换目标星时旧的先结束）
with dups as (
  select id from (
    select id, row_number() over (partition by galaxy_id order by last_heartbeat desc) as rn
    from public.shared_orbits where ended_at is null
  ) t where rn > 1
)
update public.shared_orbits set ended_at = now() where id in (select id from dups);
create unique index if not exists shared_orbits_one_active
  on public.shared_orbits (galaxy_id) where ended_at is null;

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

-- 全员在线的加成倍率（人越多越高；仅全员在线时生效）
create or replace function public.bonus_for(member_count int)
returns numeric language sql immutable as $$
  select case member_count
    when 2 then 1.5
    when 3 then 1.75
    when 4 then 1.875
    when 5 then 2
    else 1.5
  end
$$;

-- 心跳 + 能量结算：每次调用把"上次心跳至今"的时长按在线人数归入 both/solo 桶，
-- 并幂等重算目标星能量；全员离开 → 会话结束并结算。
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

  if p_active then
    r.active_members := array(select distinct unnest(r.active_members || auth.uid()));
  else
    r.active_members := array_remove(r.active_members, auth.uid());
  end if;

  if cardinality(r.active_members) = r.member_count and r.member_count > 1 then
    r.both_seconds := r.both_seconds + dt;
  elsif cardinality(r.active_members) > 0 then
    r.solo_seconds := r.solo_seconds + dt;
  end if;

  r.last_heartbeat := now();

  new_energy := greatest(
    r.base_star_energy + r.both_seconds * public.bonus_for(r.member_count) + r.solo_seconds +
      (select coalesce(sum(public.pair_energy(e.type)), 0) from public.shared_entries e
        where e.star_id = r.star_id and e.created_at >= r.started_at),
    r.base_star_energy
  );

  update public.shared_stars
    set energy = new_energy,
        lit_at = coalesce(lit_at, case when new_energy >= required then now() else null end)
    where id = r.star_id;

  if cardinality(r.active_members) = 0 then
    r.ended_at := now();
  end if;

  update public.shared_orbits set
    active_members = r.active_members,
    both_seconds = r.both_seconds, solo_seconds = r.solo_seconds,
    last_heartbeat = r.last_heartbeat, ended_at = r.ended_at
  where id = r.id;
end;
$$;

-- 创建信标：返回 6 位邀请码。
-- p_galaxy = null → 开启新的共赴（人数上限 p_capacity）；否则 → 邀请加入已有共赴。
create or replace function public.create_invite(p_capacity int default 2, p_galaxy uuid default null, p_nickname text default '')
returns text language plpgsql security definer as $$
declare
  c text;
begin
  if p_capacity < 2 or p_capacity > 5 then p_capacity := 2; end if;
  loop
    c := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (select 1 from public.invites where code = c and status = 'pending');
  end loop;
  insert into public.invites (code, creator, galaxy_id, capacity, creator_nickname)
    values (c, auth.uid(), p_galaxy, p_capacity, p_nickname);
  return c;
end;
$$;

-- 循光而来：接受邀请（p_nickname = 自取称呼）。
-- pending + galaxy_id null → 创建新共赴；pending + galaxy_id → 加入该共赴（满员则失败）；
-- accepted → 长期入口：成员幂等返回，有位置就加入。
create or replace function public.accept_invite(p_code text, p_nickname text default '')
returns uuid language plpgsql security definer as $$
declare
  inv record;
  gid uuid;
  cnt int;
  cap int;
begin
  select * into inv from public.invites
    where code = upper(p_code) and status in ('pending', 'accepted')
    for update;
  if inv is null then return null; end if;

  if inv.status = 'accepted' then
    gid := inv.galaxy_id;
    if gid is null then return null; end if;
    if exists (select 1 from public.galaxy_members where galaxy_id = gid and user_id = auth.uid()) then
      return gid;
    end if;
    select count(*) into cnt from public.galaxy_members where galaxy_id = gid;
    select capacity into cap from public.galaxies where id = gid;
    if cap is null or cnt >= cap then return null; end if;
    insert into public.galaxy_members (galaxy_id, user_id, nickname, joined_at)
      values (gid, auth.uid(), p_nickname, now());
    update public.shared_orbits set member_count = cnt + 1
      where galaxy_id = gid and ended_at is null;
    return gid;
  end if;

  if inv.galaxy_id is null then
    -- 开启新的共赴
    if inv.creator = auth.uid() then return null; end if;
    insert into public.galaxies (capacity) values (inv.capacity) returning id into gid;
    insert into public.galaxy_members (galaxy_id, user_id, nickname, joined_at)
      values (gid, inv.creator, inv.creator_nickname, now());
    insert into public.galaxy_members (galaxy_id, user_id, nickname, joined_at)
      values (gid, auth.uid(), p_nickname, now());
  else
    -- 加入已有共赴
    gid := inv.galaxy_id;
    if exists (select 1 from public.galaxy_members where galaxy_id = gid and user_id = auth.uid()) then
      update public.invites set status = 'accepted' where id = inv.id;
      return gid;
    end if;
    select count(*) into cnt from public.galaxy_members where galaxy_id = gid;
    select capacity into cap from public.galaxies where id = gid;
    if cap is null or cnt >= cap then return null; end if;
    insert into public.galaxy_members (galaxy_id, user_id, nickname, joined_at)
      values (gid, auth.uid(), p_nickname, now());
    update public.shared_orbits set member_count = cnt + 1
      where galaxy_id = gid and ended_at is null;
  end if;

  update public.invites set status = 'accepted', galaxy_id = gid where id = inv.id;
  return gid;
end;
$$;

-- 确保共赴星记录存在（幂等），返回数据库 id
create or replace function public.ensure_shared_star(p_galaxy uuid, p_constellation text, p_star text, p_required numeric default 300)
returns uuid language plpgsql security definer as $$
declare
  sid uuid;
begin
  insert into public.shared_stars (galaxy_id, constellation_id, star_id, required)
  values (p_galaxy, p_constellation, p_star, p_required)
  on conflict (galaxy_id, constellation_id, star_id) where constellation_id <> ''
    do update set galaxy_id = excluded.galaxy_id
  returning id into sid;
  return sid;
end;
$$;

-- 开始共赴在轨（有进行中的会话则复用；并发开始时靠唯一索引去重）
create or replace function public.shared_orbit_start(p_galaxy uuid, p_star uuid)
returns uuid language plpgsql security definer as $$
declare
  sid uuid;
begin
  select id into sid from public.shared_orbits
    where galaxy_id = p_galaxy and ended_at is null limit 1;
  if sid is null then
    insert into public.shared_orbits (galaxy_id, star_id, base_star_energy, member_count)
      values (p_galaxy, p_star,
        coalesce((select energy from public.shared_stars where id = p_star), 0),
        (select count(*) from public.galaxy_members where galaxy_id = p_galaxy))
    on conflict (galaxy_id) where ended_at is null do nothing;
    select id into sid from public.shared_orbits
      where galaxy_id = p_galaxy and ended_at is null limit 1;
  end if;
  return sid;
end;
$$;

-- 顺延：目标星已点亮 → 结算结束旧会话，切到下一颗星开新会话。
-- 幂等：旧会话已结束 / 他人已先顺延时，直接返回当前进行中的会话 id。
-- 注意：会话行判断务必用 %rowtype + if found、结束语句按 p_old_session 定位。
-- 曾实测：同逻辑的 record 变量 + if r is not null 写法在 PostgREST 调用下结算分支被整体跳过
-- （会话不结束、返回旧会话 id，客户端死循环），此写法已用探针验证通过，勿改回。
create or replace function public.advance_shared_orbit(p_galaxy uuid, p_old_session uuid, p_constellation text, p_star text, p_required numeric default 300)
returns uuid language plpgsql security definer as $$
declare
  old public.shared_orbits%rowtype;
  carried uuid[];
  sid uuid;
  active_id uuid;
  new_energy numeric;
begin
  select * into old from public.shared_orbits
    where id = p_old_session and ended_at is null
    for update;
  if found then
    carried := old.active_members;
    new_energy := greatest(
      old.base_star_energy + old.both_seconds * public.bonus_for(old.member_count) + old.solo_seconds +
        (select coalesce(sum(public.pair_energy(e.type)), 0) from public.shared_entries e
          where e.star_id = old.star_id and e.created_at >= old.started_at),
      old.base_star_energy
    );
    update public.shared_stars
      set energy = new_energy,
          lit_at = coalesce(lit_at, case when new_energy >= required then now() else null end)
      where id = old.star_id;
    update public.shared_orbits set ended_at = now()
      where id = p_old_session and ended_at is null;
  end if;

  select public.ensure_shared_star(p_galaxy, p_constellation, p_star, p_required) into sid;

  select id into active_id from public.shared_orbits
    where galaxy_id = p_galaxy and ended_at is null limit 1;
  if active_id is not null then return active_id; end if;

  -- 新会话延续旧会话的在轨成员名单（否则顺延后只有触发者一人在轨，其他人会僵在"不在轨"状态）
  insert into public.shared_orbits (galaxy_id, star_id, base_star_energy, member_count, active_members)
    values (p_galaxy, sid,
      coalesce((select energy from public.shared_stars where id = sid), 0),
      (select count(*) from public.galaxy_members where galaxy_id = p_galaxy),
      coalesce(carried, '{}'))
  on conflict (galaxy_id) where ended_at is null do nothing;

  select id into active_id from public.shared_orbits
    where galaxy_id = p_galaxy and ended_at is null limit 1;
  return active_id;
end;
$$;

-- 互发表达：能量立即计入目标星（不在轨时也不丢；在轨时心跳的幂等重算会覆盖为同值）
create or replace function public.add_shared_entry(p_galaxy uuid, p_star uuid, p_type text, p_text text default null, p_media text default null)
returns uuid language plpgsql security definer as $$
declare
  eid uuid;
begin
  insert into public.shared_entries (galaxy_id, star_id, author, type, text_content, media_data)
  values (p_galaxy, p_star, auth.uid(), p_type, p_text, p_media)
  returning id into eid;
  update public.shared_stars
    set energy = energy + public.pair_energy(p_type),
        lit_at = coalesce(lit_at, case when energy + public.pair_energy(p_type) >= required then now() else null end)
    where id = p_star;
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
    update public.invites set galaxy_id = null where galaxy_id = p_galaxy;
    delete from public.galaxies where id = p_galaxy;
  end if;
end;
$$;

-- 切换人数上限（2-5；不能低于当前成员数）
create or replace function public.set_galaxy_capacity(p_galaxy uuid, p_capacity int)
returns void language plpgsql security definer as $$
declare
  cnt int;
begin
  select count(*) into cnt from public.galaxy_members where galaxy_id = p_galaxy;
  if p_capacity < greatest(2, cnt) or p_capacity > 5 then return; end if;
  update public.galaxies set capacity = p_capacity where id = p_galaxy;
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

-- 清理并结算久无人心跳的会话（全员离线 90 秒后，由下次访问的任一方触发）
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
      r.base_star_energy + r.both_seconds * public.bonus_for(r.member_count) + r.solo_seconds +
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
-- 成员判断辅助函数：策略里直接查 galaxy_members 会无限递归（策略引用自己），
-- 用 security definer 函数绕过 RLS 完成判断。
create or replace function public.is_member_of(p_galaxy uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.galaxy_members gm
    where gm.galaxy_id = p_galaxy and gm.user_id = auth.uid()
  )
$$;

alter table public.invites enable row level security;
alter table public.galaxies enable row level security;
alter table public.galaxy_members enable row level security;
alter table public.shared_stars enable row level security;
alter table public.shared_orbits enable row level security;
alter table public.shared_entries enable row level security;
alter table public.presence enable row level security;

drop policy if exists "invites_read_creator" on public.invites;
drop policy if exists "galaxies_read_members" on public.galaxies;
drop policy if exists "galaxy_members_read_members" on public.galaxy_members;
drop policy if exists "stars_read_members" on public.shared_stars;
drop policy if exists "orbits_read_members" on public.shared_orbits;
drop policy if exists "entries_read_members" on public.shared_entries;
drop policy if exists "presence_read_all" on public.presence;

create policy "invites_read_creator" on public.invites
  for select using (creator = auth.uid());

create policy "galaxies_read_members" on public.galaxies
  for select using (public.is_member_of(id));

create policy "galaxy_members_read_members" on public.galaxy_members
  for select using (public.is_member_of(galaxy_id));

create policy "stars_read_members" on public.shared_stars
  for select using (public.is_member_of(galaxy_id));

create policy "orbits_read_members" on public.shared_orbits
  for select using (public.is_member_of(galaxy_id));

create policy "entries_read_members" on public.shared_entries
  for select using (public.is_member_of(galaxy_id));

create policy "presence_read_all" on public.presence
  for select using (true);

-- ---------- 实时订阅（Realtime，幂等） ----------

do $$
begin
  begin alter publication supabase_realtime add table public.invites; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.galaxies; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.galaxy_members; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.shared_stars; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.shared_orbits; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.shared_entries; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.presence; exception when duplicate_object then null; end;
end $$;
