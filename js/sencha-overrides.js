/* 
*  This class is used to override any functionality we need to in the Sencha framework.
*/


// This is to make the sorting case insensitive
Ext.util.Sorter.prototype.defaultSorterFn = function(o1, o2)
{
    var v1 = this.getRoot(o1)[this.property],
        v2 = this.getRoot(o2)[this.property];

    return v1.toLowerCase() > v2.toLowerCase() ? 1 : (v1.toLowerCase() < v2.toLowerCase() ? -1 : 0);
};

