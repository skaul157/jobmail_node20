export default async function handler(req, res) {
  const { minutes = 30, where = "Canada" } = req.query;

  try {
    const response = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=data%20engineer&country=${where}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-host": "jsearch.p.rapidapi.com",
          "x-rapidapi-key": process.env.RAPIDAPI_KEY
        }
      }
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
}
