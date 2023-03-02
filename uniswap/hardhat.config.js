require("@nomiclabs/hardhat-waffle");
require("./scripts/sampleTask");

const {subtask} = require("hardhat/config");
const {TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS} = require("hardhat/builtin-tasks/task-names")

subtask(TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS)
  .setAction(async (_, __, runSuper) => {
    const paths = await runSuper();

    // return paths.filter(p => p.includes("v3-core"));
    // return paths.filter(p => p.includes("v3-periphery"));
    return paths.filter(p => p.includes("contracts") && !p.includes("v3-core"));
  });

const LOW_OPTIMIZER_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 2_000,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
}

const LOWEST_OPTIMIZER_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 1_000,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
}

const DEFAULT_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 1_000_000,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
}


const CORE_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    optimizer: {
      enabled: true,
      runs: 800,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
}




module.exports = {
  solidity: {
    // compilers: [CORE_COMPILER_SETTINGS],
    compilers: [DEFAULT_COMPILER_SETTINGS],

    overrides: {
      'contracts/v3-periphery/NonfungiblePositionManager.sol': LOW_OPTIMIZER_COMPILER_SETTINGS,
      'contracts/v3-periphery/NonfungibleTokenPositionDescriptor.sol': LOWEST_OPTIMIZER_COMPILER_SETTINGS,
      'contracts/v3-periphery/libraries/NFTDescriptor.sol': LOWEST_OPTIMIZER_COMPILER_SETTINGS,
    },
  },
};
