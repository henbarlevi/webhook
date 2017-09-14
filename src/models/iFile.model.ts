


export interface iFile {
    id: string;
    parents: iFileParent[];
}

//res: https://developers.google.com/drive/v2/reference/parents#resource

/**
 * A reference to a file's parent.
 */
export interface iFileParent {
    /** The ID of the parent. */
    id: string,
    selfLink: string,
    parentLink: string,
    /** Whether or not the parent is the root folder  */
    isRoot: boolean
}