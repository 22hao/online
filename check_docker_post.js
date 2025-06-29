const { createClient } = require('@supabase/supabase-js');

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from('posts')
    .select('content')
    .eq('slug', 'docker-mcenysgi')
    .single();

  if (error) {
    console.log('Error:', error);
    return;
  }

  console.log('=== CONTENT FORMAT ===');
  console.log('Is HTML:', /<[^>]+>/.test(data.content));
  console.log('Contains markdown code blocks:', data.content.includes('```'));
  
  console.log('\n=== PROBLEM LINES ===');
  const lines = data.content.split('\n');
  lines.forEach((line, i) => {
    if (line.includes('docker save') && line.includes('#')) {
      console.log(`Line ${i+1}: "${line}"`);
      console.log('  Starts with #:', line.trim().startsWith('#'));
      console.log('  Matches /^#+\\s+/:', /^#+\s+/.test(line.trim()));
    }
  });

  console.log('\n=== FIRST 1000 CHARS ===');
  console.log(data.content.substring(0, 1000));
}

main().catch(console.error);
