var env = process.env.NODE_ENV; //allows us to define our environment variables. If in node, process.env.NODE_ENV will be set.  If in test, it will also be set, done in package.json in test.
console.log('env *****', env);

if(env === 'development' || env === 'test'){
    var config = require('./config.json'); //json automatically parsed to object by require
    var envConfig = config[env];

    Object.keys(envConfig).forEach((key) => {
        process.env[key] = envConfig[key];
    });
}