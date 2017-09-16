import { iFile } from './iFile.model';
//https://developers.google.com/drive/v2/reference/changes/list
//when getting the changes of user
export interface iChangesResponse {
    /**A link to the next page of changes. */
    nextLink: string;
    items: { fileId: string, file: iFile }[];
    /**
     * The page token for the next page of changes.
     *  This will be absent if the end of the changes list has been reached.
     * If the token is rejected for any reason, it should be discarded,
     * and pagination should be restarted from the first page of results.
    */
    nextPageToken?: string;
    /**
     * The starting page token for future changes. 
     * This will be present only if the end of the current changes list has been reached
     */
    newStartPageToken?: string;

}