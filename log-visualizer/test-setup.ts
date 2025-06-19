// Test setup for Bun test runner
import { beforeAll } from "bun:test";
import { GlobalRegistrator } from '@happy-dom/global-registrator';

// Setup DOM environment for React testing
beforeAll(() => {
  // Register happy-dom globally
  GlobalRegistrator.register();
  
  // Configure fetch for testing
  if (!global.fetch) {
    global.fetch = fetch;
  }
  
  // Setup any global test utilities here
  console.log("Test environment initialized with DOM");
}); 