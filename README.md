# Amrella - Social Learning Platform

Amrella is a comprehensive social learning platform built with Next.js 15, Supabase, and modern web technologies. It provides a complete ecosystem for users to connect, learn, and grow together through groups, courses, forums, and social interactions.

## 🚀 Features Overview

### ✅ **ACTIVE/READY Features**

#### **Authentication & User Management**
- ✅ User registration and login (email verification optional)
- ✅ User profiles with customizable bio, location, website
- ✅ Cover image uploads (stored as blobs in database)
- ✅ User verification system with badges (Individual, Business, Creator, Organization)
- ✅ Follow/unfollow system
- ✅ Admin role management (admin, super_admin)

#### **Social Features**
- ✅ Activity feed with posts, likes, comments
- ✅ Real-time post creation and interaction
- ✅ User profiles with posts, groups, and about sections
- ✅ Content reporting system
- ✅ Media uploads (images, videos) stored as blobs

#### **Groups System**
- ✅ Group creation and management
- ✅ Join/leave groups functionality
- ✅ Group categories and privacy settings
- ✅ Group member management
- ✅ Group cover images

#### **Forums & Discussions**
- ✅ Forum creation and categorization
- ✅ Topic creation and management
- ✅ Threaded replies system
- ✅ Forum moderation tools

#### **Courses System**
- ✅ Course creation and management
- ✅ Course enrollment system
- ✅ Progress tracking
- ✅ Course categories and levels
- ✅ Instructor profiles

#### **Events System**
- ✅ Event creation and management
- ✅ Event attendance tracking
- ✅ Virtual and physical events
- ✅ Event categories

#### **Admin Dashboard**
- ✅ Comprehensive admin panel
- ✅ User management and role assignment
- ✅ Content moderation
- ✅ Platform statistics
- ✅ Admin activity logging

#### **Support System**
- ✅ Support ticket creation
- ✅ Ticket management by admins
- ✅ Real-time messaging within tickets
- ✅ Priority and category system

### 🔄 **PARTIALLY IMPLEMENTED Features**

#### **Messaging System**
- ✅ Basic messaging interface
- ⚠️ Real-time messaging (needs WebSocket implementation)
- ⚠️ File attachments in messages

#### **Notifications**
- ✅ Basic notification structure
- ⚠️ Real-time notifications
- ⚠️ Email notifications

### ❌ **MISSING/TODO Features**

#### **Advanced Course Features**
- ❌ Video lessons with progress tracking
- ❌ Quizzes and assessments
- ❌ Course certificates
- ❌ Course reviews and ratings

#### **Advanced Social Features**
- ❌ Stories/temporary posts
- ❌ Live streaming
- ❌ Voice/video calls
- ❌ Group video calls

#### **E-commerce Features**
- ❌ Payment integration for courses
- ❌ Subscription management
- ❌ Marketplace for digital products

#### **Mobile Features**
- ❌ Push notifications
- ❌ Mobile app (React Native)
- ❌ Offline functionality

## 🏗️ Architecture

### **Tech Stack**
- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: TanStack Query (React Query)
- **File Storage**: Database BLOBs (no external services)

### **Database Schema**

#### **Core Tables**
- `profiles` - User profiles and settings
- `posts` - User posts and content
- `comments` - Post comments
- `post_likes` - Post likes tracking

#### **Social Tables**
- `follows` - User follow relationships
- `friendships` - Friend requests and connections
- `notifications` - User notifications

#### **Groups Tables**
- `groups` - Group information
- `group_members` - Group membership

#### **Learning Tables**
- `courses` - Course information
- `course_lessons` - Individual lessons
- `course_enrollments` - User enrollments
- `lesson_progress` - Learning progress

#### **Events Tables**
- `events` - Event information
- `event_attendees` - Event attendance

#### **Forums Tables**
- `forums` - Forum categories
- `forum_topics` - Discussion topics
- `forum_replies` - Topic replies

#### **Admin Tables**
- `support_tickets` - Support requests
- `support_ticket_messages` - Ticket conversations
- `reports` - Content reports
- `admin_activity_log` - Admin actions

## 📁 Project Structure

\`\`\`
amrella/
├── app/
│   ├── api/                    # API routes
│   │   ├── admin/             # Admin management APIs
│   │   ├── courses/           # Course management APIs
│   │   ├── forums/            # Forum APIs
│   │   ├── groups/            # Group management APIs
│   │   ├── reports/           # Content reporting APIs
│   │   ├── support/           # Support ticket APIs
│   │   ├── upload/            # File upload API
│   │   └── users/             # User management APIs
│   ├── admin/                 # Admin dashboard pages
│   ├── auth/                  # Authentication pages
│   ├── courses/               # Course pages
│   ├── events/                # Event pages
│   ├── forums/                # Forum pages
│   ├── groups/                # Group pages
│   ├── messages/              # Messaging pages
│   ├── profile/               # User profile pages
│   └── support/               # Support pages
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── activity-feed.tsx      # Main activity feed
│   ├── navigation.tsx         # Main navigation
│   ├── report-dialog.tsx      # Content reporting
│   └── verified-badge.tsx     # Verification badges
└── scripts/
    ├── database-setup.sql     # Initial database setup
    ├── admin-and-features-setup.sql  # Admin features
    └── complete-features-setup.sql   # Complete feature set
\`\`\`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Git

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd amrella
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up Supabase**
   - Create a new Supabase project
   - Get your project URL and anon key
   - Run the SQL scripts in order:
     1. `scripts/database-setup.sql`
     2. `scripts/admin-and-features-setup.sql`
     3. `scripts/complete-features-setup.sql`

4. **Configure environment variables**
   \`\`\`bash
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   \`\`\`

5. **Configure Supabase Auth**
   - In Supabase Dashboard → Authentication → Settings
   - Set "Site URL" to `http://localhost:3000`
   - Add `http://localhost:3000/api/auth/callback` to redirect URLs
   - Optionally disable email confirmation for immediate login

6. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

7. **Create your first admin user**
   - Register a new account
   - In Supabase SQL Editor, run:
     \`\`\`sql
     UPDATE profiles SET role = 'super_admin' WHERE email = 'your-email@example.com';
     \`\`\`

## 📊 API Endpoints

### **Authentication**
- `GET /api/auth/callback` - Auth callback handler

### **User Management**
- `GET /api/users/[id]` - Get user profile
- `PATCH /api/users/[id]` - Update user profile
- `POST /api/users/[id]/follow` - Follow user
- `DELETE /api/users/[id]/follow` - Unfollow user

### **Groups**
- `GET /api/groups` - List groups
- `POST /api/groups` - Create group
- `POST /api/groups/[id]/join` - Join group
- `DELETE /api/groups/[id]/join` - Leave group

### **Courses**
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course
- `POST /api/courses/[id]/enroll` - Enroll in course

### **Forums**
- `GET /api/forums` - List forums
- `POST /api/forums` - Create forum
- `GET /api/forums/[id]/topics` - Get forum topics
- `POST /api/forums/[id]/topics` - Create forum topic

### **Admin**
- `GET /api/admin/users` - List users (admin only)
- `PATCH /api/admin/users` - Update user (admin only)

### **Support**
- `GET /api/support/tickets` - List support tickets
- `POST /api/support/tickets` - Create support ticket
- `GET /api/support/tickets/[id]/messages` - Get ticket messages
- `POST /api/support/tickets/[id]/messages` - Send ticket message

### **Content Moderation**
- `GET /api/reports` - List reports (admin only)
- `POST /api/reports` - Submit content report

### **File Upload**
- `POST /api/upload` - Upload files (stored as database blobs)

## 🔧 Configuration

### **Supabase Configuration**

1. **Row Level Security (RLS)**
   - All tables have RLS enabled
   - Policies ensure users can only access their own data
   - Admins have elevated permissions

2. **Database Functions**
   - `handle_new_user()` - Creates profile on user registration
   - `log_admin_activity()` - Logs admin actions
   - Various trigger functions for maintaining counts

3. **Storage**
   - All media files stored as BYTEA in database
   - No external storage dependencies
   - Base64 encoding for transport

### **Authentication Settings**
- Email verification: Optional (can be disabled)
- Password requirements: Standard Supabase defaults
- Session management: Automatic with Supabase Auth

## 🎨 UI Components

### **Custom Components**
- `VerifiedBadge` - User verification indicators
- `ReportDialog` - Content reporting interface
- `ActivityFeed` - Main social feed
- `Navigation` - Platform navigation

### **shadcn/ui Components Used**
- Button, Card, Input, Textarea
- Dialog, Dropdown, Tabs, Badge
- Avatar, Progress, ScrollArea
- Select, Label, Separator

## 🔒 Security Features

### **Authentication & Authorization**
- JWT-based authentication via Supabase
- Role-based access control (user, admin, super_admin)
- Protected API routes with middleware
- Row-level security on all database tables

### **Content Safety**
- User reporting system for inappropriate content
- Admin moderation tools
- Content filtering capabilities
- User blocking and suspension

### **Data Protection**
- All user data encrypted at rest
- Secure file upload handling
- Input validation and sanitization
- CORS protection

## 🚀 Deployment

### **Vercel Deployment**
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Environment Variables for Production**
\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
\`\`\`

### **Database Migration**
- Run all SQL scripts in your production Supabase instance
- Update any hardcoded URLs in the database
- Set up proper backup schedules

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### **Code Standards**
- TypeScript for all new code
- ESLint and Prettier for formatting
- Comprehensive error handling
- Responsive design principles

## 📈 Performance Considerations

### **Database Optimization**
- Proper indexing on frequently queried columns
- Efficient query patterns with Supabase
- Connection pooling handled by Supabase

### **Frontend Optimization**
- React Query for efficient data fetching
- Image optimization with Next.js
- Code splitting and lazy loading
- Responsive images and assets

## 🐛 Known Issues & Limitations

1. **Real-time Features**: Some features like live messaging need WebSocket implementation
2. **File Size Limits**: Large file uploads may hit database limits
3. **Mobile Experience**: Optimized for desktop, mobile improvements needed
4. **Search**: Basic search functionality, could be enhanced with full-text search

## 📞 Support

For technical support or questions:
- Create an issue in the GitHub repository
- Use the built-in support ticket system
- Check the documentation and API reference

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Amrella** - Connecting learners, creators, and communities in one powerful platform.
