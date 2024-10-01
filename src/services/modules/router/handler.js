const waitHandler = async (parameters, context) => {
    const { duration } = parameters;
    await new Promise((resolve) => setTimeout(resolve, duration));
    return context.inputData;
  };
  
  module.exports = waitHandler;