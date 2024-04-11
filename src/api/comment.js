import http from "@/utils/request";
export default {
  /**
   * 查询评论列表
   * @returns
   */
  async getCommentListApi(params) {
    return await http.getRestApi("/api/comment/list", params);
  },
  /**
   * 添加评论
   * @returns
   */
  async addCommentApi(params) {
    return await http.post("/api/comment/add", params);
  },
  /**
   * 删除评论
   */
  async deleteCommentApi(params) {
    return await http.delete("/api/comment/delete", params);
  },
};
