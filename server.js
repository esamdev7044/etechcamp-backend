const app = require("./app");

require("dotenv").config();
app.listen(process.env.PORT, function () {
  console.log(`Server started on port ${process.env.PORT} `);
});
