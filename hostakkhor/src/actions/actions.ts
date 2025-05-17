/**
 * Create a new page
 * @param pageData - The page data to create
 * @returns Promise<string> - The ID of the created page
 */
export const createPage = async (pageData: Omit<IPage, 'id'>): Promise<string> => {
  try {
    const pagesCollection = getQuarksInstance().collection<IPage>('pages');
    const newPageId = Date.now().toString();
    
    const newPage: IPage = {
      id: newPageId,
      ...pageData,
      created_at: Date.now()
    };
    
    await pagesCollection.doc(newPageId).set(newPage);
    
    toast({
      title: "Page created",
      description: "Your page has been created successfully",
    });
    
    return newPageId;
  } catch (error) {
    console.error("Error creating page:", error);
    toast({
      title: "Error",
      description: "Failed to create page. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};