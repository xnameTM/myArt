// id,title,artist_title,description,subject_titles,image_id

export interface ArtworkModel {
    id: number;
    title: string;
    artist_title: string;
    description: string;
    subject_titles: string[];
    image_id: string;
    image: string;
    height: number;
}