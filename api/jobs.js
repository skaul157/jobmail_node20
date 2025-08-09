// /api/jobs.js  — Vercel Node 20 serverless function
export default async function handler(req, res) {
  try {
    const key = process.env.RAPIDAPI_KEY;
    if (!key) return res.status(500).json({ error: "Missing RAPIDAPI_KEY" });

    const url = new URL("https://jsearch.p.rapidapi.com/search");
    const roles = [
      "Data Engineer",
      "AI Engineer",
      "Azure Data Engineer",
      "ML Engineer",
    ];
    const q = req.query.q || `${roles.join(" OR ")} in Canada`;
    const where = req.query.where || "Canada";
    const minutes = parseInt(req.query.minutes || "30", 10);

    url.searchParams.set("query", `${q} in ${where}`);
    url.searchParams.set("page", "1");
    url.searchParams.set("num_pages", "1");
    url.searchParams.set("date_posted", "last_24_hours");

    const r = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": key,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
    });
    if (!r.ok) {
      const txt = await r.text();
      return res.status(502).json({ error: "Upstream error", details: txt });
    }
    const data = await r.json();

    // Filter to last N minutes
    const now = Date.now();
    const fresh = (data.data || []).filter((j) => {
      const t = Date.parse(j.job_posted_at_datetime_utc);
      return isFinite(t) && now - t <= minutes * 60 * 1000;
    });

    res.status(200).json({
      count: fresh.length,
      minutes,
      where,
      roles,
      results: fresh.map((j) => ({
        title: j.job_title,
        company: j.employer_name,
        location: j.job_city || j.job_country,
        posted_utc: j.job_posted_at_datetime_utc,
        link: j.job_apply_link,
        source: j.job_publisher,
      })),
    });
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
}
