const fs = require('fs');

// 模拟一个简单的测试
const testContent = `### 导入导出
\`\`\`plain
docker save -o 镜像名.tar 镜像名          导出镜像
docker load -i 镜像名加路径               导入镜像
# docker save -o centos.tar centos      导出centos镜像到本地当前目录
\`\`\``;

console.log('=== TEST CONTENT ===');
console.log(testContent);
console.log('\n=== ANALYSIS ===');

// 检查是否包含代码块
const hasCodeBlocks = testContent.includes('```');
console.log('Has code blocks:', hasCodeBlocks);

// 模拟 ReactMarkdown 的处理
const ReactMarkdown = require('react-markdown');
console.log('ReactMarkdown available:', !!ReactMarkdown);

