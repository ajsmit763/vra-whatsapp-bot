const { createRuntime } = require('./app');
async function main() {
  const {pool,tracker}=createRuntime();
  try {
    const result=await tracker.runScheduled();
    console.log(`Scheduled check completed. Jobs requiring attention: ${result.attention}`);
    if(result.attention) process.exitCode=1;
  } finally { await pool.end(); }
}
main().catch(()=>{console.error('Scheduled check failed. Check the database, delivery attempts and configured environment.');process.exitCode=1;});
