import { AnyObject } from '@ukef/dtfs2-common';

/**
 * objectsAreEqual
 * compares two objects to see if they are equal
 * returns true if they are equal
 * @param {AnyObject} object1
 * @param {AnyObject} object2
 * @returns {Boolean}
 */
const objectsAreEqual = (object1: AnyObject, object2: AnyObject): boolean => JSON.stringify(object1) === JSON.stringify(object2);

export default objectsAreEqual;
