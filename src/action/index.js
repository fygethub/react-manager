/**
 * Created by 叶子 on 2017/7/30.
 */
import * as type from './type';

export const receiveData = (data, category) => ({
    type: type.RECEIVE_DATA,
    data,
    category
});
