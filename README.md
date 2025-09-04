# Application Features & Corresponding Firestore Security

This document outlines all the features of the Fantom eSport website that interact with Firestore and explains how the `firestore.rules` file secures them.

## 1. User Accounts & Profiles

*   **Features:**
    *   User registration (email/password).
    *   Users can set a unique username upon signup or change it later.
    *   Users can set their profile picture via a URL.
    *   Users can view other users' profiles.
    *   User profiles display posts, shorts, follower/following counts, and total likes.
*   **Security Rules:**
    *   **`/users/{userId}`:**
        *   A user can only create their own user document.
        *   A user can only update their own profile data (e.g., username, photoURL). They cannot change their verification status.
        *   The Admin can update any user's profile (to assign verification).
        *   Anyone can read profile data to view user pages.
    *   **`/usernames/{username}`:**
        *   A separate collection to enforce unique usernames.
        *   A user can only create a username document that matches the username in their own user document. This prevents impersonation.

## 2. Content Creation

*   **Features:**
    *   Any authenticated user can create a blog post.
    *   Any authenticated user can create a short video post.
    *   Posts can include titles, content, categories, and optional image/video URLs (YouTube, TikTok, Facebook).
*   **Security Rules:**
    *   **`/blogPosts/{postId}`** and **`/shorts/{shortId}`:**
        *   **Create:** Any signed-in user (`request.auth != null`) can create a post, but the `authorId` in the post must match their own `uid`.
        *   **Read:** Anyone can read posts and shorts (public content).
        *   **Update:** Only the original author or an Admin can update/edit a post's content.
        *   **Delete:** Only the original author or an Admin can delete a post.

## 3. Social Interaction

*   **Features:**
    *   Users can "like" and "unlike" blog posts and short videos.
    *   Users can comment on posts and shorts.
    *   Users can reply to comments on blog posts.
    *   Users can follow and unfollow other users.
*   **Security Rules:**
    *   **Liking (`/blogPosts/{postId}` & `/shorts/{shortId}`):**
        *   The `update` rule is configured to allow any signed-in user to modify *only* the `likes` array on a document. They cannot change the title, content, or other fields.
    *   **Comments & Replies (`.../comments/{commentId}` & `.../replies/{replyId}`):**
        *   Any signed-in user can create a comment or reply.
        *   Only the author of a comment/reply or an Admin can delete it.
    *   **Following (`/users/{userId}/followers/{followerId}` & `/users/{userId}/following/{followingId}`):**
        *   A user can only add/remove documents in their own `following` subcollection.
        *   A user can only add/remove their own ID from another user's `followers` subcollection.

## 4. Private Messaging

*   **Features:**
    *   Users can initiate a private chat with another user from their profile page.
    *   Messages can be text, or a direct URL to an image/video.
    *   The Admin can view all conversation metadata (participants) but not the message content itself.
*   **Security Rules:**
    *   **`/chats/{chatId}`:**
        *   Read/Write/Update access is only granted if the requesting user's `uid` is in the `users` array of the chat document. This is the core security for private chats.
        *   Admin can `get` (read a single document) but not `list` (read the whole collection's content) to see participants for moderation purposes.
    *   **`/chats/{chatId}/messages/{messageId}`:**
        *   Read/Create access is only granted by checking the parent `chat` document to ensure the user is a participant.

## 5. Verification System

*   **Features:**
    *   Users can register as a "Creator" or "Clan Owner".
    *   Users can submit a request for a Blue (Creator) or Gold (Clan Owner) verification badge from their profile page.
    *   Admin can approve or deny these requests from the Admin Panel.
*   **Security Rules:**
    *   **`/verificationRequests/{requestId}`:**
        *   **Create:** A user can only create a request for their own `uid`.
        *   **Read/Update:** Only the Admin can read the list of requests and update their status. Regular users cannot see or modify other requests.

## 6. Administrator Panel & Site Management

*   **Features:**
    *   Admin has a dedicated panel to manage all site content.
    *   Admin can view all users and their activity.
    *   Admin can add/edit/delete roster members, announcements, games, and all content on the "About" and "Home" pages.
*   **Security Rules:**
    *   An `isAdmin()` helper function checks if the requesting user's email matches the hardcoded admin email.
    *   This function is used throughout the rules to grant write/delete access to collections like `/roster`, `/announcements`, `/games`, `/siteSettings`, etc.
    *   This ensures that only the designated administrator can manage sitewide content.

































































