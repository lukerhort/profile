# AE 403W WIG Project — Website Setup Guide
**From Zero to Live Website (Free with GitHub Pages)**

---

## Overview

This guide uses **GitHub Pages** — it's completely free, professional-looking, and lets you update the site by just uploading files. No monthly fees, no credit card. Your site URL will be something like `lukeh.github.io/wig-project`.

Total time to a live site: **30–60 minutes**.

---

## Part 1: Create a GitHub Account

**Step 1:** Go to [github.com](https://github.com) and click **Sign up**.

**Step 2:** Enter your email, create a password, and pick a username. Use something clean like `lukeh` or `sdsu-wig-team` — this becomes part of your URL.

**Step 3:** Verify your email. GitHub will send a confirmation link.

**Step 4:** On the plan selection screen, choose **Free**. You do not need a paid plan.

---

## Part 2: Create Your Project Repository

A "repository" (repo) is just a folder on GitHub that holds your website files.

**Step 1:** Once logged in, click the green **"New"** button on the left sidebar (or go to `github.com/new`).

**Step 2:** Fill in the settings:
- **Repository name:** `wig-project` (no spaces — use hyphens)
- **Description:** Wing in Ground Effect Vehicle — AE 403W, SDSU
- **Visibility:** Public ← this is required for free GitHub Pages
- Check **"Add a README file"**
- Leave everything else as default

**Step 3:** Click **"Create repository"**.

You now have an empty project folder on GitHub.

---

## Part 3: Enable GitHub Pages

**Step 1:** Inside your new repository, click the **Settings** tab (gear icon, top right area).

**Step 2:** In the left sidebar, scroll down and click **"Pages"**.

**Step 3:** Under "Source," click the dropdown that says **"None"** and select **"main"**. Leave the folder as `/ (root)`. Click **Save**.

**Step 4:** GitHub will show you a green banner: *"Your site is published at https://yourusername.github.io/wig-project"*

It takes 1–2 minutes to go live the first time.

---

## Part 4: Create Your Homepage (index.html)

Your site's main page must be named `index.html`. Here's how to create it directly on GitHub (no coding software needed):

**Step 1:** Go back to your repository's main page (click the repo name at the top).

**Step 2:** Click **"Add file" → "Create new file"**.

**Step 3:** Name the file `index.html`.

**Step 4:** Paste the following starter template into the editor. Replace the placeholder text with your real content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AE 403W — Wing in Ground Effect Vehicle</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #1a1a1a; color: #f0f0f0; }

    header {
      background: #FF9900;
      color: white;
      padding: 40px 20px;
      text-align: center;
    }
    header h1 { font-size: 2.5em; margin-bottom: 10px; }
    header p  { font-size: 1.2em; opacity: 0.9; }

    nav {
      background: #222;
      display: flex;
      justify-content: center;
      gap: 30px;
      padding: 14px;
    }
    nav a { color: #FF9900; text-decoration: none; font-weight: bold; font-size: 1em; }
    nav a:hover { text-decoration: underline; }

    section {
      max-width: 900px;
      margin: 40px auto;
      padding: 0 20px;
    }
    section h2 {
      font-size: 1.8em;
      color: #FF9900;
      border-bottom: 2px solid #FF9900;
      padding-bottom: 8px;
      margin-bottom: 20px;
    }
    section p { line-height: 1.7; margin-bottom: 16px; color: #ccc; }

    .stats {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      margin-bottom: 30px;
    }
    .stat-box {
      background: #2a2a2a;
      border: 1px solid #FF9900;
      border-radius: 8px;
      padding: 20px 30px;
      text-align: center;
      flex: 1;
      min-width: 140px;
    }
    .stat-box .number { font-size: 2em; color: #FF9900; font-weight: bold; }
    .stat-box .label  { font-size: 0.85em; color: #aaa; margin-top: 4px; }

    .team-grid {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }
    .team-member {
      background: #2a2a2a;
      border-radius: 8px;
      padding: 20px;
      flex: 1;
      min-width: 180px;
      text-align: center;
    }
    .team-member .name  { font-weight: bold; font-size: 1.1em; color: #FF9900; }
    .team-member .role  { font-size: 0.85em; color: #aaa; margin-top: 4px; }

    .update-card {
      background: #2a2a2a;
      border-left: 4px solid #FF9900;
      border-radius: 4px;
      padding: 16px 20px;
      margin-bottom: 16px;
    }
    .update-card .date  { font-size: 0.8em; color: #FF9900; margin-bottom: 6px; }
    .update-card h3     { font-size: 1.1em; margin-bottom: 8px; }
    .update-card p      { margin: 0; font-size: 0.95em; }

    .photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
    }
    .photo-grid img {
      width: 100%;
      border-radius: 6px;
      border: 2px solid #333;
    }

    footer {
      background: #111;
      text-align: center;
      padding: 24px;
      color: #555;
      font-size: 0.85em;
      margin-top: 60px;
    }
  </style>
</head>
<body>

<header>
  <h1>Wing in Ground Effect Vehicle</h1>
  <p>AE 403W Senior Design Project &nbsp;|&nbsp; San Diego State University &nbsp;|&nbsp; Spring 2026</p>
</header>

<nav>
  <a href="#about">About</a>
  <a href="#specs">Design Specs</a>
  <a href="#progress">Build Log</a>
  <a href="#team">Team</a>
  <a href="#media">Media</a>
</nav>

<!-- ABOUT -->
<section id="about">
  <h2>About the Project</h2>
  <p>
    We are a team of four aerospace engineering students at SDSU building a radio-controlled
    Wing in Ground Effect (WIG) vehicle — a "flying boat" that uses the aerodynamic benefit
    of flying very close to a surface to dramatically increase efficiency. Our prototype
    demonstrates ground effect at RC scale using 3D printing, carbon fiber, and a custom
    flight controller setup.
  </p>
  <p>
    Ground effect occurs when a wing flies within roughly one wingspan of the ground.
    The surface disrupts wingtip vortices, reducing induced drag and increasing lift —
    meaning the vehicle can fly faster or carry more weight for the same power.
  </p>

  <div class="stats">
    <div class="stat-box">
      <div class="number">5.4 ft</div>
      <div class="label">Wingspan</div>
    </div>
    <div class="stat-box">
      <div class="number">5.4</div>
      <div class="label">Aspect Ratio</div>
    </div>
    <div class="stat-box">
      <div class="number">4</div>
      <div class="label">Motors</div>
    </div>
    <div class="stat-box">
      <div class="number">~8 lb</div>
      <div class="label">Est. Weight</div>
    </div>
    <div class="stat-box">
      <div class="number">FX 63-137</div>
      <div class="label">Airfoil</div>
    </div>
  </div>
</section>

<!-- DESIGN SPECS -->
<section id="specs">
  <h2>Design Specifications</h2>
  <p><strong>Airfoil:</strong> FX 63-137 (high-lift, low-speed, proven in GEV designs)</p>
  <p><strong>Wingspan:</strong> 5.4 ft (5.8 ft with winglets)</p>
  <p><strong>Mean Chord:</strong> 12 inches</p>
  <p><strong>Wing Area:</strong> 5.4 ft²</p>
  <p><strong>Outboard Anhedral Angle:</strong> 15°</p>
  <p><strong>Inverted Winglet Height:</strong> 3.03 in</p>
  <p><strong>Propulsion:</strong> 4× BrotherHobby Tornado T5 3115 Pro motors, 4× Skywalker V2 ESCs</p>
  <p><strong>Battery:</strong> 2× Ovonic 6S LiPo 5200mAh</p>
  <p><strong>Flight Controller:</strong> Pixhawk 6C (PX4 / ArduPilot)</p>
  <p><strong>Rangefinder:</strong> Radar altimeter (water-capable, for ride height measurement)</p>
  <p><strong>Structure:</strong> 3D printed ASA + ABS over carbon fiber spar skeleton</p>
</section>

<!-- BUILD LOG -->
<section id="progress">
  <h2>Build Log</h2>

  <div class="update-card">
    <div class="date">February 23, 2026</div>
    <h3>Week 5–6: Parts Arriving, Printing Started</h3>
    <p>Motors, ESCs, batteries, propellers, carbon fiber spars, and all filament have arrived.
       3D printing of fuselage components is underway. Remaining electronics (flight controller,
       GPS, servos, radio) being ordered this week.</p>
  </div>

  <div class="update-card">
    <div class="date">February 6, 2026</div>
    <h3>Week 4: Design Finalized, Proposal Submitted</h3>
    <p>Design locked: FX 63-137 airfoil, AR=5.4, 5.4ft wingspan, 4-motor distributed
       propulsion. Proposal submitted and approved. Major components ordered.</p>
  </div>

  <div class="update-card">
    <div class="date">January 2026</div>
    <h3>Weeks 1–3: Research & Trade Studies</h3>
    <p>Researched historical WIG vehicles (Caspian Sea Monster, Lun class, Orlyonok).
       Completed airfoil trade study comparing FX 63-137, NACA 4412, and GAW-1.
       Selected FX 63-137 for its superior low-speed lift characteristics.</p>
  </div>
</section>

<!-- TEAM -->
<section id="team">
  <h2>The Team</h2>
  <div class="team-grid">
    <div class="team-member">
      <div class="name">Luke Horton</div>
      <div class="role">Aerospace Engineering</div>
    </div>
    <div class="team-member">
      <div class="name">Ethan Barichievich</div>
      <div class="role">Aerospace Engineering</div>
    </div>
    <div class="team-member">
      <div class="name">Willie Peterson</div>
      <div class="role">Aerospace Engineering</div>
    </div>
    <div class="team-member">
      <div class="name">Maxwell O'Neill</div>
      <div class="role">Aerospace Engineering</div>
    </div>
  </div>
</section>

<!-- MEDIA -->
<section id="media">
  <h2>Media</h2>
  <p>Build photos, CAD renders, and flight test videos will be posted here as the project progresses.</p>

  <!-- To add a YouTube video, paste this and replace VIDEO_ID:
  <div style="position:relative;padding-bottom:56.25%;margin-bottom:20px;">
    <iframe src="https://www.youtube.com/embed/VIDEO_ID"
      style="position:absolute;width:100%;height:100%;border:0;"
      allowfullscreen></iframe>
  </div>
  -->

  <!-- To add photos, drop images into your repo and reference them like this:
  <div class="photo-grid">
    <img src="photos/build_01.jpg" alt="Fuselage printing">
    <img src="photos/wing_assembly.jpg" alt="Wing assembly">
  </div>
  -->
  <p style="color:#555; font-style:italic;">[ Photos and videos coming soon ]</p>
</section>

<footer>
  AE 403W — Wing in Ground Effect Vehicle &nbsp;|&nbsp; SDSU Aerospace Engineering &nbsp;|&nbsp; Spring 2026
</footer>

</body>
</html>
```

**Step 5:** Scroll to the bottom, make sure **"Commit directly to the main branch"** is selected, and click **"Commit new file"**.

**Step 6:** Wait 1–2 minutes, then visit `https://yourusername.github.io/wig-project`. Your site is live.

---

## Part 5: Updating the Site

Every time you want to update the site:

**Option A — Edit directly on GitHub (easiest):**
1. Go to your repo on github.com
2. Click the file you want to edit (e.g., `index.html`)
3. Click the **pencil icon** (Edit)
4. Make your changes
5. Scroll down and click **"Commit changes"**
6. The site updates within 1–2 minutes

**Option B — Upload photos:**
1. In your repo, click **"Add file" → "Upload files"**
2. Create a `photos/` folder by naming a file `photos/your-image.jpg`
3. Drag in your photos
4. Click **"Commit changes"**
5. Reference photos in your HTML as `<img src="photos/your-image.jpg">`

---

## Part 6: Adding Videos

You have two approaches:

**YouTube embeds (recommended):**
1. Upload your video to YouTube (can be Unlisted if you don't want it public)
2. Click Share → Embed, copy the `<iframe>` code
3. Paste it into your `index.html` inside the Media section

**Self-hosted video (for short clips):**
1. Upload your `.mp4` file into the repo (under `videos/`)
2. Add this to your HTML:
```html
<video controls width="100%" style="border-radius:6px;">
  <source src="videos/first_flight.mp4" type="video/mp4">
</video>
```

---

## Part 7: Custom Domain (Optional, ~$12/year)

If you want `wigproject.com` instead of `username.github.io/wig-project`:

1. Buy a domain at [namecheap.com](https://namecheap.com) or [Google Domains](https://domains.google) (~$12/year for `.com`)
2. In your GitHub repo Settings → Pages, enter your domain under "Custom domain"
3. In your domain registrar's DNS settings, add a CNAME record pointing to `yourusername.github.io`
4. Takes ~10 minutes to propagate

---

## Keeping the Build Log Updated

The easiest workflow for regular updates:
- Every time you hit a milestone (wing printed, motors tested, first flight), edit the Build Log section
- Add a new `<div class="update-card">` block with the date and description
- Upload any new photos to `photos/` and reference them

This becomes your project journal and is a great thing to show in your final presentation.

---

## What to Post and When

| Milestone | What to post |
|-----------|-------------|
| Printing starts | Time-lapse video, photo of first layer |
| Wing assembled | Photo of full wing with spars installed |
| Electronics wired | Bench test video showing motors spinning |
| First ground run | Short video of vehicle rolling/taxiing |
| First flight | Full video from multiple angles |
| CFD results | Screenshots of XFLR5 polar plots |
| Final report | Link to PDF |
