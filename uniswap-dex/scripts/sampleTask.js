require("hardhat/config");

task("sampleTask", "A sample task with params")
  .addPositionalParam("param1")
  .addPositionalParam("param2")
  .setAction(async (taskArgs) => {
    console.log(taskArgs);
  });