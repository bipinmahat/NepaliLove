# Nepali Dating App

## Overview
A fully functional Nepali dating app built with React, TailwindCSS, and PostgreSQL. Features include user authentication via Replit Auth, profile management, Tinder-style swiping, real-time chat, match notifications, and comprehensive settings.

## Project Architecture

### Frontend (React + TypeScript)
- **Framework**: React with Vite
- **Styling**: TailwindCSS with shadcn/ui components
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state
- **Authentication**: Replit Auth integration

### Backend (Express + TypeScript)
- **Server**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions

### Database Schema
- **Users**: Profile information, authentication data
- **Profiles**: Extended user details, photos, preferences
- **Swipes**: User interactions (like/pass)
- **Matches**: Mutual likes between users
- **Conversations**: Chat threads
- **Messages**: Individual chat messages
- **Sessions**: Authentication session storage

## Current Features

### ✅ Completed Features
- **User Authentication**: Replit Auth integration with proper session management
- **Profile Management**: Complete profile creation, editing, and photo upload
- **Discovery System**: Tinder-style swiping with match detection
- **Chat System**: Real-time messaging between matched users
- **Settings Management**: Dating preferences, notifications, privacy controls
- **Match Notifications**: Popup notifications when users match
- **Demo Data**: Test profiles for development and demonstration

### Core Pages
1. **Landing Page**: Welcome screen for non-authenticated users
2. **Home Page**: Dashboard for authenticated users
3. **Discover Page**: Swiping interface with profile cards
4. **Chat Page**: Message list and individual chat windows
5. **Matches Page**: Grid view of all user matches
6. **Profile Page**: User profile with stats and settings

## Recent Changes

### 2025-01-24
- ✅ Fixed critical swiping functionality - resolved "Failed to process swipe" errors
- ✅ Implemented all Profile page settings modals (Edit Profile, Dating Preferences, Notifications, Privacy & Safety)
- ✅ Enhanced match popup with correct user photos and names from both profiles
- ✅ Fixed database connection issues by creating new PostgreSQL database
- ✅ Resolved all TypeScript errors and data type issues throughout the application
- ✅ Restored original chat implementation per user preference
- ✅ Fixed SelectItem error in preferences modal (changed empty string values to "any")
- ✅ Completed comprehensive TypeScript fixes for Chat component
- ✅ Removed all demo/bot users for production deployment
- ✅ Fixed foreign key constraint errors in conversation creation
- ✅ Improved profile edit modal with proper form reset functionality
- ✅ Updated discovery page with appropriate empty state for real users only
- ✅ Fixed photo upload functionality with increased file size limit (50MB)
- ✅ Removed duplicate close buttons in edit profile modal
- ✅ Removed non-functional settings button from profile header
- ✅ Added photo preview functionality in edit modal

## User Preferences
- **Chat Implementation**: Use the original/first chat code implementation (self-contained within Chat.tsx)
- **Database**: PostgreSQL instead of Firebase due to platform requirements
- **UI Style**: Clean, professional interface with Nepali cultural branding
- **Error Handling**: Comprehensive error states and user feedback

## Technical Notes

### Database Configuration
- Uses PostgreSQL with Drizzle ORM
- Session storage in database for reliability
- All tables successfully migrated and operational

### Authentication Flow
- Replit OpenID Connect integration
- Automatic user profile creation on first login
- Session-based authentication with database storage

### Chat System Architecture
- Original implementation: Self-contained in Chat.tsx
- Supports both chat list view and individual chat windows
- Real-time message sending and receiving
- Proper user identification and profile pictures

## Development Status
**Current State**: Fully functional Nepali dating app with all core features operational. Ready for deployment and use.

**Next Steps**: Future enhancements could include video calling, location-based matching, and admin dashboard features.