const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors({
    origin: "*",
}));

const PATH = path.join(__dirname, "time_series_DB.db");
const PORT = process.env.PORT || 3050;

let db = null;

const intializeDBAndServer = async () => {
    try {
        db = await open({
            filename: PATH,
            driver: sqlite3.Database
        }) 
        app.listen(PORT, () => console.log(`running http://localhost:${PORT}`));
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}

intializeDBAndServer();

app.get("/api/time-series-data", async (req, res) => {
    const {period = "daily"} = req.query;   
    let SQL_QUERY = `SELECT strftime("%d-%m-%Y", timestamp) as day, AVG(value) as value from time_series_data
            GROUP BY day;`

    if (period === "weekly") {
        SQL_QUERY = `SELECT strftime("%d-%m-%Y", timestamp) as day, AVG(value) as value from time_series_data
            GROUP BY strftime("%W-%Y", timestamp);`
    }
    if (period === "monthly") {
        SQL_QUERY = `SELECT strftime("%d-%m-%Y", timestamp) as day, AVG(value) as value from time_series_data
            GROUP BY strftime("%m-%Y", timestamp);`
    }
    const dbResponse = await db.all(SQL_QUERY);
    res.send(dbResponse)
})