# Changelog

All notable changes to LockIn will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-02

### Added
- Initial production release
- Core page locking functionality with modal overlay
- Password-based authentication with session persistence
- Configurable via data attributes on script tag
- Required attributes: `data-lockin-key`, `data-lockin-password`
- Optional attributes: `data-lockin-title`, `data-lockin-message`, `data-lockin-placeholder`, `data-lockin-submit`, `data-lockin-error`, `data-lockin-branding`, `data-lockin-max-attempts`
- XSS protection with HTML escaping for all user inputs
- Smooth animations (fade-in, slide-up, shake on error)
- Error handling with visual feedback
- Optional branding control (show/hide "Protected by LockIn")
- Attempt limiting with configurable maximum attempts
- Mobile-responsive design
- Session storage for authentication persistence
- Production build with minification (7.6KB)
- Comprehensive documentation in README
- Demo page with working examples
- Usage examples for various scenarios
- Build tooling with npm scripts

### Security
- All user-configurable text properly escaped to prevent XSS
- Simple password hashing for client-side verification
- Session-based authentication with validation
- Proper note in documentation about client-side security limitations

### Files
- `lockin.js` - Main source file (11.4KB, 373 lines)
- `lockin.min.js` - Minified production version (7.6KB)
- `demo.html` - Interactive demonstration page
- `examples.html` - Usage examples
- `README.md` - Complete documentation
- `LICENSE` - Commercial license terms
- `package.json` - Build configuration
- `.gitignore` - Git ignore rules

[1.0.0]: https://github.com/ReceiptX/lockin-page/releases/tag/v1.0.0
