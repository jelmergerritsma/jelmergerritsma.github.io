export default defineAppConfig({
  ui: {
    colors: {
      primary: "green",
      neutral: "slate"
    },
    drawer: {
      slots: {
        overlay: "fixed inset-0 bg-elevated/95",
        content: "rounded-t-2xl!"
      }
    }
  }
})
