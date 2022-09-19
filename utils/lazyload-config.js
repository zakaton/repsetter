const config = {
  elements_selector: ".lazy",
  threshold: 100,
  callback_enter: (element) => {
    console.log("enter", element);
  },
  callback_exit: (element) => {
    console.log("Exit", element);
  },
};
export default config;
