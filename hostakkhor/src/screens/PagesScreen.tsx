import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

const PagesScreen = ({ route }) => {
  const { pageId } = route.params;
  const [pageInfo, setPageInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch page info based on pageId
    const fetchPageInfo = async () => {
      try {
        const response = await fetch(`https://proxy.hostakkhor.com/proxy/getsorted?keys=hostakkhor_users_*&skip=0&limit=50&filter=${encodeURIComponent(JSON.stringify({ where: { pageId: { eq: pageId }, } }))}`);
        const page = await response.json();
        setPageInfo(page);
      } catch (error) {
        console.error('Failed to fetch page info:', error);
      } finally {
        setLoading(false);
      }
    };

    console.log('Page ID:', pageId);
    fetchPageInfo();
  }, [pageId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!pageInfo) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Page not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{pageInfo.name}</Text>
      <Text style={styles.description}>{pageInfo.bio}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,    
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
});

export default PagesScreen;