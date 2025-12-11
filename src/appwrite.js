import { Client, TablesDB, ID, Query } from "appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;


const client = new Client()
  .setEndpoint("https://nyc.cloud.appwrite.io/v1")
  .setProject(PROJECT_ID);

const tables = new TablesDB(client);

export const updateSearchCount = async (searchTerm, movie) => {
  try{
    const result = await tables.listRows(DATABASE_ID, COLLECTION_ID, [
      Query.equal('searchTerm', searchTerm)
    ])

    if(result.rows.length > 0){
      const doc = result.rows[0];

      await tables.updateRow(DATABASE_ID, COLLECTION_ID, doc.$id, {
        count: doc.count + 1,
      })
    } else{
      await tables.createRow(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm,
        count: 1,
        movie_id: movie.id,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      });
    }
  } catch(error){
    console.error(error);
  }
}

export const getTrendingMovies = async () => {
  try{
    const result = await tables.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc("count")
    ])

    return result.documents;
  } catch(error){
    console.error(error);
  }
}