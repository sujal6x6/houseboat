-- Run this once against the D1 database bound to the Pages project as DB.
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rates (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  eb INTEGER NOT NULL DEFAULT 0,
  cnb TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  image TEXT NOT NULL,
  available INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS gallery (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  src TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  plan TEXT NOT NULL,
  room TEXT,
  guests INTEGER NOT NULL DEFAULT 1,
  checkin TEXT NOT NULL,
  checkout TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS bookings_checkin_idx ON bookings(checkin);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status);

INSERT OR IGNORE INTO rates(code,name,description,price,eb,cnb) VALUES
  ('EP','European Plan','Room only',2250,580,'Complimentary'),
  ('CP','Continental Plan','Room + breakfast',2850,700,'500'),
  ('MAPI','Modified American Plan','Room + breakfast + one main meal',4050,1100,'650'),
  ('API','American Plan','Room + breakfast + lunch + dinner',5250,1600,'850');

INSERT OR IGNORE INTO rooms(id,name,type,image,available) VALUES
  ('heritage-suite','Heritage Suite','King bed · Lake views','images/rooms/heritage-suite-2.jpeg',1),
  ('deluxe-room','Deluxe Room','Queen bed · Breakfast','images/rooms/deluxe-room-1.jpeg',1),
  ('royal-suite','Royal Suite','King bed · Private lounge','images/rooms/royal-suite-1.jpeg',1),
  ('lake-view-room','Lake View Room','Lake view · Couples','images/rooms/lakeview-room-1.jpeg',1),
  ('premium-room','Premium Room','Double bed · Attached bath','images/rooms/premium-room-2.jpeg',1),
  ('family-room','Family Room','Family stay · Flexible beds','images/rooms/family-room.jpeg',1);

INSERT OR IGNORE INTO settings(key,value) VALUES
  ('propertyName','New Peony Group of Houseboats'),
  ('phone','+91 96826 54524'),
  ('instagram','https://www.instagram.com/houseboat_new_peony_/?utm_source=qr'),
  ('facebook','https://www.facebook.com/profile.php?id=100077064371242&mibextid=wwXIfr'),
  ('whatsapp','+91 96826 54524'),
  ('location','Nigeen Lake, Srinagar, Kashmir');
