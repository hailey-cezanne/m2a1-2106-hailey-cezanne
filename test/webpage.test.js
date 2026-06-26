import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'

const path = (rel) => fileURLToPath(new URL(rel, import.meta.url))
const read = (rel) => readFileSync(path(rel), 'utf8')

const doc = new JSDOM(read('../src/index.html')).window.document

// Read styles.css as text. JSDOM does not compute layout, so layout properties
// are graded by checking the stylesheet for the CSS the activity asks for.
// Comments are stripped and whitespace removed so "display: flex" and
// "display:flex" both match.
const cssPath = path('../src/styles.css')
const css = existsSync(cssPath)
  ? readFileSync(cssPath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  : ''
const cssFlat = css.replace(/\s+/g, '').toLowerCase()
const textOf = (el) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim()

describe('Activity 1 – Portfolio skeleton + Flexbox', () => {
  it('is a valid HTML5 page (doctype, lang, title, utf-8 charset)', () => {
    expect(doc.doctype?.name?.toLowerCase(), 'Add <!DOCTYPE html>').toBe('html')
    expect(doc.documentElement.getAttribute('lang'), 'Set lang on <html>').toBeTruthy()
    expect(textOf(doc.querySelector('head title')), 'Add a non-empty <title>').toBeTruthy()
    expect(doc.querySelector('meta[charset]'), 'Add <meta charset="utf-8">').not.toBeNull()
  })

  it('links an external stylesheet (styles.css) and the file has CSS in it', () => {
    const link = doc.querySelector('link[rel="stylesheet"][href]')
    expect(link, 'Link your stylesheet from the head: <link rel="stylesheet" href="styles.css">').not.toBeNull()
    expect(existsSync(cssPath), 'Create a styles.css file in src/').toBe(true)
    expect(cssFlat.length, 'styles.css looks empty - add your layout rules').toBeGreaterThan(0)
  })

  it('uses an external stylesheet only (no style="" attributes)', () => {
    expect(
      doc.querySelectorAll('[style]').length,
      'Move inline style="" rules into styles.css - no inline styles this module',
    ).toBe(0)
  })

  it('uses the semantic sections header, nav, main, footer + section blocks', () => {
    for (const tag of ['header', 'nav', 'main', 'footer']) {
      expect(doc.querySelector(tag), `Add a <${tag}> element`).not.toBeNull()
    }
    expect(
      doc.querySelectorAll('section').length,
      'Use <section> blocks for your wireframe areas (about, projects, contact, ...)',
    ).toBeGreaterThanOrEqual(2)
  })

  it('the nav holds an unordered list of at least three links', () => {
    expect(doc.querySelector('nav ul'), 'Put a <ul> inside <nav>').not.toBeNull()
    expect(
      doc.querySelectorAll('nav ul li a[href]').length,
      'Add at least three nav links',
    ).toBeGreaterThanOrEqual(3)
  })

  it('lays out with Flexbox (display:flex)', () => {
    expect(cssFlat, 'Use display:flex in styles.css to lay out a row').toContain('display:flex')
  })

  it('aligns flex items along an axis and spaces them with a gap', () => {
    const aligns = /(justify-content|align-items):/.test(cssFlat)
    expect(aligns, 'Use justify-content and/or align-items to position flex items').toBe(true)
    expect(cssFlat, 'Space flex items with a gap').toContain('gap:')
  })

  it('centres the page with a max-width and auto margins', () => {
    expect(cssFlat, 'Give a container a max-width').toContain('max-width:')
    expect(
      /margin:[^;]*auto/.test(cssFlat) || /margin-(left|right):auto/.test(cssFlat),
      'Centre the page with auto left/right margins',
    ).toBe(true)
  })
})

describe('Student info (student.json)', () => {
  const info = JSON.parse(read('../student.json'))
  it('student.json is filled in', () => {
    for (const field of [
      'classCode', 'fullName', 'studentNumber',
      'studentEmail', 'personalEmail', 'githubAccount',
    ]) {
      expect(info[field], `Set "${field}" in student.json`).toBeTruthy()
    }
  })
})
