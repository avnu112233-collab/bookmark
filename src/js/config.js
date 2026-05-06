// CONFIG - From Arduino ESP32 Code
const SUPABASE_URL = 'https://rcavggmzvspihstjwyil.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjYXZnZ216dnNwaWhzdGp3eWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NjE5NDgsImV4cCI6MjA4MDMzNzk0OH0.S2sdUUXYoeU3kZOQMfsit69iljVVE0I-D5iD4CV7DK8';
const ESP32_IP = '10.117.250.188'; // User provided ESP32 IP

// Initialize Supabase client (with error handling)
let supabaseClient = null;
if (typeof window.supabase !== 'undefined') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
