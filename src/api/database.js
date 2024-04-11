import http from "@/utils/request";
export default {
  /**
   * 查询数据列表
   * @param params
   * @returns
   */
  async getDatabaseList(params) {
    return await http.get("/api/database/list", params);
  },

  /**
   * 添加数据
   * @param params
   * @returns
   */
  async addDatabase(params) {
    return await http.post("/api/database/add", params);
  },
  /**
   * 查询部门id
   * @param params
   * @returns
   */
  async getDepIdByUserId(params) {
    return await http.getRestApi("/api/database/depId", params);
  },
  /**
   * 编辑数据
   * @param params
   * @returns
   */
  async updateDatabase(params) {
    return await http.put("/api/database/update", params);
  },

  /**
   * 删除数据
   * @param params
   * @returns
   */
  async deleteDatabase(params) {
    return await http.delete("/api/database/delete", params);
  },
};
