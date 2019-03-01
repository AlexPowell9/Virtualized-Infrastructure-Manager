let run = async () => {
    const config = require("../config/config");
    await require(`../config/${config.SETUP_TEST_ENV_LOCATION}`)();

}

run();
