// Master Empirical Test Runner for Brainimation DSP & Browser Filters
// Runs both updateShortChannelRegression and updateEEGImuMotionFilter test suites

console.log('================================================================');
console.log('   BRAINIMATION EMPIRICAL CHALLENGER 2: DSP & BROWSER FILTERS   ');
console.log('================================================================\n');

require('./test_short_channel.js');
console.log('\n----------------------------------------------------------------\n');
require('./test_imu_motion_filter.js');

console.log('\n================================================================');
console.log('   ALL EMPIRICAL VERIFICATION HARNESS TESTS EXITED SUCCESSFULLY ');
console.log('================================================================');
