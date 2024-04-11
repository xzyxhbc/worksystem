<template>
  <el-main>
    <!-- 查询条件 -->
    <el-form
      :model="searchModel"
      ref="searchForm"
      label-width="80px"
      :inline="true"
      size="small"
    >
      <el-form-item>
        <el-input v-model="searchModel.filename" placeholder="请输入工具名称" />
      </el-form-item>
      <el-form-item>
        <el-input v-model="searchModel.precis" placeholder="请输入工具功能" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="search()"
          >查询</el-button
        >
        <el-button icon="el-icon-refresh-right" @click="resetValue()"
          >重置</el-button
        >
        <el-button type="success" icon="el-icon-plus" @click="openAddWindow()"
          >上传</el-button
        >
      </el-form-item>
    </el-form>
    <!--数据表格-->
    <el-table
      :data="toolList"
      :height="tableHeight"
      border
      stripe
      style="width: 100%; margin-bottom: 10px"
    >
      <el-table-column prop="username" label="作者"></el-table-column>
      <el-table-column prop="filename" label="工具名"></el-table-column>
      <el-table-column prop="precis" label="功能简介"></el-table-column>
      <el-table-column prop="uploadTime" label="上传时间"></el-table-column>
      <el-table-column label="图标">
        <template slot-scope="scope">
          <img
            :src="scope.row.logo"
            alt="图标"
            style="width: 50px; height: 50px"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" width="290" label="操作">
        <template slot-scope="scope">
          <el-button
            icon="el-icon-download"
            type="warning"
            size="mini"
            @click="handleDwonload(scope.row)"
            >下载</el-button
          >
          <el-button
            icon="el-icon-edit"
            type="primary"
            size="small"
            @click="handleEdit(scope.row)"
            >编辑</el-button
          >
          <el-button
            icon="el-icon-close"
            type="danger"
            size="small"
            @click="handleDelete(scope.row)"
            >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 添加和编辑用户窗口 -->
    <system-dialog
      :title="toolDialog.title"
      :height="toolDialog.height"
      :width="toolDialog.width"
      :visible="toolDialog.visible"
      @onClose="onClose"
      @onConfirm="onConfirm"
    >
      <div slot="content">
        <el-form
          :model="tool"
          ref="toolForm"
          :rules="rules"
          label-width="80px"
          :inline="true"
          size="small"
        >
          <el-form-item prop="filename" label="工具名称">
            <el-input v-model="tool.filename"></el-input>
          </el-form-item>
          <div style="margin-top: 10px"></div>
          <el-form-item prop="precis" label="简介">
            <el-input
              type="textarea"
              rows="3"
              v-model="tool.precis"
              style="width: 500px"
            ></el-input>
          </el-form-item>
          <div style="margin-top: 10px"></div>
          <!-- 工具图标 -->
          <el-form-item label="图标">
            <el-upload
              :show-file-list="false"
              :on-success="handleLogoSuccess"
              :before-upload="beforeLogoUpload"
              class="logo-uploader"
              :data="uploadHeader"
              action="http://localhost:8888/api/oss/file/upload?module=logo"
            >
              <img v-if="tool.logo" :src="tool.logo" />
              <i v-else class="el-icon-plus logo-uploader-icon" />
            </el-upload>
          </el-form-item>
          <el-form-item label="工具">
            <el-upload
              :show-file-list="false"
              :on-success="handleToolSuccess"
              class="tool-uploader"
              :data="uploadHeader"
              action="http://localhost:8888/api/oss/file/upload?module=fileData"
            >
              <img v-if="tool.fileData"
              src=https://work-system.oss-cn-shanghai.aliyuncs.com/logo/2024/04/07/eb880fd3fb7a43aabdd074b0bd708c3d.jpg
              />
              <i v-else class="el-icon-plus tool-uploader-icon"></i>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
    </system-dialog>
  </el-main>
</template>
<script>
import toolApi from "@/api/tool";
//导入对话框组件
import SystemDialog from "@/components/system/SystemDialog.vue";
//导入token
import { getToken } from "@/utils/auth";
import axios from "axios";
export default {
  name: "toolList",
  //注册组件
  components: {
    SystemDialog,
  },
  data() {
    return {
      //查询条件
      searchModel: {
        filename: "", // 工具名称
        precis: "", // 工具简介
      },
      toolList: [],
      tableHeight: 0, //表格高度
      //工具对象
      tool: {
        id: "",
        username: "",
        filename: "",
        precos: "",
        logo: "",
        uploadTime: "",
        fileData: "",
      },
      //添加和修改工具窗口属性
      toolDialog: {
        title: "",
        height: 610,
        width: 810,
        visible: false,
        type: "",
      },
      //上传需要携带的数据
      uploadHeader: { token: getToken() },
      rules: {
        filename: [
          { required: true, trigger: "change", message: "请输入工具名称" },
        ],
        precis: [
          { required: true, trigger: "blur", message: "请输入工具简介" },
        ],
      },
    };
  },
  methods: {
    async search() {
      //发送查询请求
      let res = await toolApi.getToolListApi(this.searchModel);
      //执行成功
      if (res.success) {
        //工具列表
        this.toolList = res.data;
      }
    },
    /**
     * 重置查询条件
     */
    resetValue() {
      //清空查询条件
      this.searchModel = {
        filename: "",
        precis: "",
      };
      //重新查询
      this.search();
    },
    openAddWindow() {
      this.$resetForm("toolForm", this.tool); //清空表单数据
      this.toolDialog.title = "新增工具"; //设置窗口标题
      this.toolDialog.visible = true; //显示窗口
    },
    /**
     * 编辑工具
     * @param  row
     */
    handleEdit(row) {
      let res = this.$store.getters.name;
      if (row.username != res) {
        this.$message.error("不是自己的工具，不能编辑");
        return;
      }
      this.toolDialog.title = "工具编辑"; //设置标题
      this.toolDialog.visible = true; //显示窗口
      //把当前编辑的数据复制到表单数据域，供回显使用
      this.$objCopy(row, this.tool);
    },
    /**
     * 新增或编辑取消事件
     */
    onClose() {
      this.toolDialog.visible = false; //关闭窗口
    },
    /**
     * 新增或编辑确认事件
     */
    onConfirm() {
      this.$refs.toolForm.validate(async (valid) => {
        if (valid) {
          let res = null;
          //判断操作类型
          if (this.tool.id == "") {
            //新增
            //发送添加请求
            this.tool.username = this.$store.getters.name;
            this.tool.uploadTime = new Date();
            res = await toolApi.addToolApi(this.tool);
          } else {
            //发送修改请求
            res = await toolApi.updateToolApi(this.tool);
          }
          //判断是否成功
          if (res.success) {
            this.$message.success(res.message);
            //刷新
            this.search();
            //关闭窗口
            this.toolDialog.visible = false;
          } else {
            this.$message.error(res.message);
          }
        }
      });
    },
    /**
     *  工具下载
     * @param
     */
    async handleDwonload(row) {
      //确认是否下载
      let confirm = await this.$myconfirm("确定要下载该工具吗?");
      if (confirm) {
        try {
          // 获取令牌
          const token = await getToken(); // 假设 getToken() 返回一个 Promise
          console.log(token);
          // 发送GET请求到后端的下载接口
          const response = await axios({
            url: "http://localhost:8888/api/tool/download", // 替换为实际的下载接口URL
            method: "get",
            responseType: "blob", // 告诉axios期望服务器返回的数据类型
            params: {
              // 如果需要传递参数，可以在这里添加
              file: row.fileData,
            },
            headers: {
              token: token, // 使用获取到的令牌值
            },
          });
          let name =
            row.filename +
            row.fileData.substring(row.fileData.lastIndexOf("."));
          // 创建下载链接
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", name); // 设置下载文件名
          document.body.appendChild(link);
          link.click();

          // 释放URL对象
          window.URL.revokeObjectURL(url);
          document.body.removeChild(link);
        } catch (error) {
          console.error("下载失败:", error);
          this.$message.error("下载失败，请检查您的网络连接或文件是否存在。");
        }
      }
    },
    /**
     * 上传成功回调
     * @param res
     * @param file
     */
    handleLogoSuccess(res, file) {
      this.tool.logo = res.data;
      // 强制重新渲染
      this.$forceUpdate();
    },
    handleToolSuccess(res, file) {
      this.tool.fileData = res.data;
      // 强制重新渲染
      this.$forceUpdate();
    },
    /**
     * 上传校验
     * @param file
     * @returns {boolean}
     */
    beforeLogoUpload(file) {
      const isJPG = file.type === "image/jpeg";
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },
    /**
     * 删除工具
     * @param row
     */
    async handleDelete(row) {
      let res = this.$store.getters.name;
      if (row.username != res && this.tool.username != res) {
        this.$message.error("不是您上传的工具，不能删除");
        return;
      }
      //确认是否删除
      let confirm = await this.$myconfirm("确定要删除该工具吗?");
      if (confirm) {
        //发送删除请求
        let res = await toolApi.deleteToolApi({ id: row.id });
        //判断是否成功
        if (res.success) {
          //成功提示
          this.$message.success(res.message);
          //刷新
          this.search();
        } else {
          //失败提示
          this.$message.error(res.message);
        }
      }
    },
  },
  created() {
    //调用查询工具列表的方法
    this.search();
  },
  mounted() {
    this.$nextTick(() => {
      this.tableHeight = window.innerHeight - 220;
    });
  },
};
</script>

<style lang="scss">
.logo-uploader .el-upload {
  border: 1px dashed #d9d9d9 !important;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.logo-uploader .el-upload:hover {
  border-color: #409eff;
}
.logo-uploader .logo-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.logo-uploader img {
  width: 178px;
  height: 178px;
  display: block;
}
.logo-uploader img {
  width: 178px;
  height: 178px;
  display: block;
}
.tool-uploader .el-upload {
  border: 1px dashed #d9d9d9 !important;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.tool-uploader .el-upload:hover {
  border-color: #409eff;
}
.tool-uploader .tool-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.tool-uploader img {
  width: 178px;
  height: 178px;
  display: block;
}
</style>