package tn.esprit.communitymicroservice.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.communitymicroservice.entities.Post;
import tn.esprit.communitymicroservice.repositories.PostRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService {
    @Autowired
    private PostRepository postRepository;

    public Post createPost(Post post) {
        try {
            post.setCreatedAt(LocalDateTime.now());
            System.out.println("Creating post: " + post.getContent() + " for group: " + 
                              (post.getGroup() != null ? post.getGroup().getId() : "null"));
            Post savedPost = postRepository.save(post);
            System.out.println("Post saved with ID: " + savedPost.getId());
            return savedPost;
        } catch (Exception e) {
            System.err.println("Error creating post: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create post: " + e.getMessage());
        }
    }

    public List<Post> getAllPosts() {
        try {
            List<Post> posts = postRepository.findAllOrderByCreatedAtDesc();
            System.out.println("Found " + posts.size() + " total posts");
            return posts;
        } catch (Exception e) {
            System.err.println("Error getting all posts: " + e.getMessage());
            return postRepository.findAll(); // Fallback
        }
    }

    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
    }

    public List<Post> getPostsByGroupId(Long groupId) {
        try {
            System.out.println("Looking for posts in group: " + groupId);
            List<Post> posts = postRepository.findByGroupId(groupId);
            System.out.println("Found " + posts.size() + " posts for group " + groupId);
            return posts;
        } catch (Exception e) {
            System.err.println("Error getting posts by group: " + e.getMessage());
            // Fallback: filter all posts by group ID
            try {
                List<Post> allPosts = postRepository.findAll();
                List<Post> filteredPosts = allPosts.stream()
                    .filter(p -> p.getGroup() != null && p.getGroup().getId().equals(groupId))
                    .collect(Collectors.toList());
                System.out.println("Fallback: Found " + filteredPosts.size() + " posts for group " + groupId);
                return filteredPosts;
            } catch (Exception fallbackError) {
                System.err.println("Fallback also failed: " + fallbackError.getMessage());
                return List.of(); // Return empty list
            }
        }
    }

    public List<Post> getPostsByClubId(Long clubId) {
        try {
            System.out.println("Looking for posts in club: " + clubId);
            List<Post> posts = postRepository.findByClubId(clubId);
            System.out.println("Found " + posts.size() + " posts for club " + clubId);
            return posts;
        } catch (Exception e) {
            System.err.println("Error getting posts by club: " + e.getMessage());
            // Fallback: filter all posts by club ID
            try {
                List<Post> allPosts = postRepository.findAll();
                List<Post> filteredPosts = allPosts.stream()
                    .filter(p -> p.getClub() != null && p.getClub().getId().equals(clubId))
                    .collect(Collectors.toList());
                System.out.println("Fallback: Found " + filteredPosts.size() + " posts for club " + clubId);
                return filteredPosts;
            } catch (Exception fallbackError) {
                System.err.println("Fallback also failed: " + fallbackError.getMessage());
                return List.of(); // Return empty list
            }
        }
    }

    public Post updatePost(Long id, Post updated) {
        try {
            Post post = getPostById(id);
            post.setContent(updated.getContent());
            if (updated.getIsAnnouncement() != null) {
                post.setIsAnnouncement(updated.getIsAnnouncement());
            }
            return postRepository.save(post);
        } catch (Exception e) {
            System.err.println("Error updating post: " + e.getMessage());
            throw new RuntimeException("Failed to update post: " + e.getMessage());
        }
    }

    public void deletePost(Long id) {
        try {
            postRepository.deleteById(id);
            System.out.println("Post deleted with ID: " + id);
        } catch (Exception e) {
            System.err.println("Error deleting post: " + e.getMessage());
            throw new RuntimeException("Failed to delete post: " + e.getMessage());
        }
    }
}
