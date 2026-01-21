import { testDbConnection } from './index';

testDbConnection().then((result) => {
  process.exit(result ? 0 : 1);
});
