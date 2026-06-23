-- ── Projects ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  title          TEXT    NOT NULL,
  slug           TEXT    NOT NULL DEFAULT '',
  description    TEXT    NOT NULL,
  content        TEXT    NOT NULL DEFAULT '',
  tech           TEXT    NOT NULL DEFAULT '[]',  -- JSON array
  role           TEXT    NOT NULL DEFAULT '',
  live_url       TEXT,
  case_study_url TEXT,
  github_url     TEXT,
  logo_url       TEXT,
  cover_url      TEXT,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Blog posts ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  title            TEXT    NOT NULL,
  slug             TEXT    NOT NULL UNIQUE,
  content          TEXT    NOT NULL DEFAULT '',  -- Markdown
  excerpt          TEXT,
  meta_description TEXT,
  og_image         TEXT,
  keywords         TEXT,
  author           TEXT    NOT NULL DEFAULT 'Your Name',
  author_avatar    TEXT,
  author_bio       TEXT,
  status           TEXT    NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')),
  published_at     DATETIME,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Seed: Scoutlify case study ───────────────────────────────────────────────
INSERT OR IGNORE INTO projects (id, title, slug, description, content, tech, role, logo_url, live_url, case_study_url, github_url, sort_order) VALUES
  (1, 'Scoutlify', 'scoutlify',
   'A modern real estate marketplace connecting property seekers, brokers, agents, agencies, and developers through a streamlined property discovery experience.',
   '## Overview

**Industry:** Real Estate Technology (PropTech)
**Project Type:** Property Listing Marketplace Platform

Scoutlify is a modern real estate marketplace designed to connect property seekers, brokers, agents, agencies, and property developers through a streamlined property discovery experience. The platform simplifies property listing management, improves lead generation, and provides users with powerful tools to search, compare, and inquire about properties.

## The Challenge

Many real estate platforms suffer from common problems: cluttered user interfaces, difficult property submission workflows, poor mobile experience, limited analytics for agents and brokers, lack of communication tools between buyers and sellers, slow property discovery, and expensive listing promotion systems.

The challenge was to build a platform that could make property discovery effortless, help agents generate more leads, allow agencies to manage large inventories, create a modern user experience, and scale for future growth.

## Project Goals

**For Property Seekers**
- Easily search properties
- Save favourite listings
- Contact agents directly
- Schedule property visits
- Access complete property information

**For Brokers and Agents**
- Create and manage listings
- Promote properties
- Track listing performance
- Receive and manage leads efficiently

**For Agencies**
- Manage multiple agents
- Access advanced analytics
- Increase listing visibility
- Centralise property management

## Research & Discovery

The project began with competitor research across Zillow, Realtor.com, Redfin, Lamudi, and Property24. Key improvement opportunities identified were navigation simplicity, mobile responsiveness, listing management, analytics accessibility, and lead tracking workflows.

## Solution

Scoutlify was designed as a complete property marketplace ecosystem.

**Property Listings** — Users can create listings with title, description, address, property type, pricing, amenities, specifications, and high-resolution images.

**Advanced Search** — Filter by location, property type, price range, bedrooms, bathrooms, lot area, and floor area.

**Interactive Maps** — Automatic address detection displays property locations through integrated mapping.

**Inquiry System** — Buyers can send inquiries, contact agents, request information, and schedule visits.

**User Dashboard** — Owners and agents can manage listings, edit property information, monitor inquiries, and view performance metrics.

**Analytics System** — Track listing views, inquiry volume, conversion performance, popular properties, and visitor trends.

**Wishlist** — Users can save properties and revisit them later.

**Review System** — Property professionals can build trust through reviews and ratings.

## UI/UX Design Process

The platform was built around four design principles:

1. **Simplicity** — Reduce unnecessary steps and distractions.
2. **Speed** — Allow users to find properties quickly.
3. **Trust** — Create a professional, credible experience.
4. **Mobile-First** — Ensure usability across all devices.

Filters are organised into intuitive categories rather than overwhelming users with options. Listing creation is divided into logical sections — Basic Information, Location, Property Details, Pricing, Media Upload, and Contact Information — reducing abandonment. Property cards emphasise images, price, location, and key specifications for efficient comparison.

## Development Challenges

**Property Data Structure** — Properties vary significantly in attributes. A flexible database structure was designed to support residential, commercial, and land listings.

**Address Mapping** — Manual map pin placement is frustrating. Automatic address detection and map rendering was implemented via MapTiler.

**Lead Management** — Agents struggle to track inquiries. A centralised inquiry management system was integrated directly into the dashboard.

## Results

- Improved property discoverability
- Increased inquiry generation for agents
- Reduced listing management time
- Better lead tracking and performance visibility
- Enhanced mobile experience across devices

## What I Learned

Building Scoutlify reinforced several important principles: user experience is critical in marketplace platforms; simplicity often outperforms feature-heavy interfaces; mobile-first design must be considered from the start; analytics provide significant value to business users; and scalable architecture reduces future technical debt.

## Services Provided

Product Strategy · UX Research · UI Design · Frontend Development · Backend Development · Database Architecture · API Development · System Architecture · Performance Optimisation · Responsive Web Development',
   '["Angular","TypeScript","Node.js","Express.js","MySQL","MapTiler","PayPal API","REST APIs","HTML5","CSS3","JavaScript"]',
   'Founder, UI/UX Designer, Frontend Developer, Backend Developer',
   '/logos/scoutlify-logo.svg', NULL, NULL, NULL, 1);

-- ── Post comments ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_comments (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  parent_id  INTEGER REFERENCES post_comments(id) ON DELETE CASCADE,
  author     TEXT    NOT NULL,
  email      TEXT    NOT NULL,
  body       TEXT    NOT NULL,
  status     TEXT    NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','spam')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Client inquiries ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inquiries (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL,
  message    TEXT    NOT NULL,
  ip_address TEXT,
  is_read    INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
