export const fetchPostById = async (postId: string) => {
    const API_BASE_URL = 'https://proxy.hostakkhor.com/proxy';
    const url = `${API_BASE_URL}/getsorted?keys=hostakkhor_posts_${postId}`;
  
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
      const data = await response.json();
      return data.result?.[0]?.value || null;
    } catch (error) {
      console.error('Error fetching post by ID:', error);
      return null;
    }
  };