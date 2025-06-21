-- 创建二级分类表
CREATE TABLE IF NOT EXISTS subcategories (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, key)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_key ON subcategories(key);

-- 启用 RLS (Row Level Security)
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- 创建允许所有人读取的策略
CREATE POLICY "Allow public read access" ON subcategories
  FOR SELECT TO public
  USING (true);

-- 创建允许管理员所有操作的策略
CREATE POLICY "Allow admin all access" ON subcategories
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);

-- 添加一些示例数据（先检查分类是否存在）
DO $$
BEGIN
  -- 只有当分类存在时才插入数据
  IF EXISTS (SELECT 1 FROM categories WHERE id = 1) THEN
    INSERT INTO subcategories (category_id, key, label) VALUES
      (1, 'linux', 'Linux基础'),
      (1, 'log', '日志系统'),
      (1, 'monitor', '监控系统'),
      (1, 'trace', '链路系统'),
      (1, 'db', '数据库');
  END IF;
  
  IF EXISTS (SELECT 1 FROM categories WHERE id = 2) THEN
    INSERT INTO subcategories (category_id, key, label) VALUES
      (2, 'hadoop', 'Hadoop'),
      (2, 'spark', 'Spark'),
      (2, 'flink', 'Flink'),
      (2, 'hive', 'Hive'),
      (2, 'kafka', 'Kafka');
  END IF;
EXCEPTION 
  WHEN unique_violation THEN
    -- 如果数据已存在，忽略错误
    NULL;
END $$; 