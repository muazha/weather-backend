import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
function validate(value, name) {
    if (value === undefined || value === "" || value === null) {
        return `${name} must be filled`;
    }
    return null;
}

async function getWeather(lat, lon, lang) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_KEY}&units=metric&lang=${lang}`);

    if (!response.ok) {
        throw new Error("Weather API failed");
    }

    const data = await response.json();
    return data
}


app.get("/weather", async (req, res) => {

    const { lat, lon, lang } = req.query;

    const error =
        validate(lat, "lat") ||
        validate(lon, "lon") ||
        validate(lang, "lang");

    if (error) {
        return res.status(400).json({ error });
    }

    const latNum = Number(lat);
    const lonNum = Number(lon);

    if (Number.isNaN(latNum) || Number.isNaN(lonNum)) {
        return res.status(400).json({
            error: "Coordinates must be numbers"
        });
    }

    if (latNum > 90 || latNum < -90) {
        return res.status(400).json({ error: "Invalid latitude" });
    }

    if (lonNum > 180 || lonNum < -180) {
        return res.status(400).json({ error: "Invalid longitude" });
    }

    if (!["ar", "en"].includes(lang)) {
        return res.status(400).json({ error: "Invalid language" });
    }

    try {
        const data = await getWeather(latNum, lonNum, lang);
        return res.json(data);
    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});