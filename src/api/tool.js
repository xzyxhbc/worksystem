import http from "@/utils/request";
export default {
  /**
   * 查询工具列表
   * @returns
   */
  async getToolListApi(params) {
    return await http.get("/api/tool/list", params);
  },
  /**
   * 添加工具
   * @returns
   */
  async addToolApi(params) {
    return await http.post("/api/tool/add", params);
  },
  /**
   * 删除工具
   * @returns
   */
  async deleteToolApi(params) {
    return await http.delete("/api/tool/delete", params);
  },
  /**
   * 上传工具
   * @returns
   */
  async uploadToolApi(params) {
    return await http.post("/api/tool/upload", params);
  },
  /**
   * 下载工具
   * @returns
   */
  async downloadToolApi(params) {
    return await http.get("/api/tool/download", params);
  },
  /**
   * 编辑工具
   * @returns
   */
  async updateToolApi(params) {
    return await http.put("/api/tool/update", params);
  },
};
