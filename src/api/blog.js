import http from "@/utils/request";
export default {
  /**
   * 查询博客列表
   * @returns
   */
  async getBlogListApi(params) {
    return await http.get("/api/blog/list", params);
  },
  /**
   * 添加博客
   * @returns
   */
  async addBlogApi(params) {
    return await http.post("/api/blog/add", params);
  },
  /**
   * 编辑博客
   * @returns
   */
  async updateBlogApi(params) {
    return await http.put("/api/blog/update", params);
  },
  /**
   * 删除博客
   * @returns
   */
  async deleteBlogApi(params) {
    return await http.delete("/api/blog/delete", params);
  },
  /**
   * 点赞博客
   */
  async enjoyBlogApi(params) {
    return await http.getRestApi("/api/blog/enjoy", params);
  },
};
