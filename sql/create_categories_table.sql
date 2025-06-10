-- 创建分类表
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建更新时间的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at 
  BEFORE UPDATE ON categories 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 插入预定义分类
INSERT INTO categories (name, description) VALUES
  ('SRE实践', 'Site Reliability Engineering 实践经验分享'),
  ('运维自动化', '自动化运维工具和流程'),
  ('监控告警', '系统监控和告警相关技术'),
  ('故障处理', '故障排查和处理经验'),
  ('容器化', 'Docker、Kubernetes等容器技术'),
  ('云原生', '云原生技术和最佳实践'),
  ('性能优化', '系统性能优化经验'),
  ('架构设计', '系统架构设计和演进'),
  ('工具推荐', '实用工具和技术推荐'),
  ('技术分享', '各类技术知识分享')
ON CONFLICT (name) DO NOTHING; 