<template>
  <el-container :style="{ height: containerHeight + 'px' }">
    <!-- 左侧部门树形菜单列表 -->
    <el-aside
      style="
        padding: 10px 0px 0px 0px;
        background: #fff;
        border-right: 1px solid #dfe6ec;
      "
      width="220px"
    >
      <el-tree
        style="font-size: 14px"
        ref="leftTree"
        :data="deptList"
        node-key="id"
        :props="defaultProps"
        default-expand-all
        empty-text="暂无数据"
        :show-checkbox="false"
        :highlight-current="true"
        :expand-on-click-node="false"
        @node-click="handleNodeClick"
      >
        <div class="custom-tree-node" slot-scope="{ node, data }">
          <div>
            <span v-if="data.children.length == 0">
              <i class="el-icon-document"></i>
            </span>
            <span v-else @click.stop="openBtn(data)">
              <svg-icon v-if="data.open" icon-class="add-s" />
              <svg-icon v-else icon-class="sub-s" />
            </span>
            <!-- 名称 -->
            <span style="margin-left: 3px">{{ node.label }}</span>
          </div>
        </div>
      </el-tree>
    </el-aside>
    <!-- 右侧用户数据 -->
    <!-- 表格数据 -->
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
          <el-input v-model="searchModel.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="searchModel.content" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item>
          <el-button
            icon="el-icon-search"
            type="primary"
            @click="search(departmentId, pageNo, pageSize)"
            >查询</el-button
          >
          <el-button icon="el-icon-refresh-right" @click="resetValue()"
            >重置</el-button
          >
          <el-button
            icon="el-icon-plus"
            size="small"
            type="success"
            @click="openAddWindow()"
            >新增</el-button
          >
        </el-form-item>
      </el-form>
      <!-- 用户表格数据 -->
      <el-table
        :height="tableHeight"
        :data="databaseList"
        border
        stripe
        style="width: 100%; margin-bottom: 10px"
      >
        <el-table-column prop="title" label="标题"></el-table-column>
        <el-table-column prop="username" label="作者"></el-table-column>
        <el-table-column prop="createTime" label="创建时间"></el-table-column>
        <el-table-column prop="content" label="内容"></el-table-column>
        <el-table-column align="center" width="290" label="操作">
          <template slot-scope="scope">
            <el-button
              icon="el-icon-edit"
              type="primary"
              size="mini"
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
      <!-- 分页工具栏 -->
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageNo"
        :page-sizes="[10, 20, 30, 40, 50]"
        :page-size="10"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
      <!-- 添加和编辑用户窗口 -->
      <system-dialog
        :title="databaseDialog.title"
        :height="databaseDialog.height"
        :width="databaseDialog.width"
        :visible="databaseDialog.visible"
        @onClose="onClose"
        @onConfirm="onConfirm"
      >
        <div slot="content">
          <el-form
            :model="database"
            ref="databaseForm"
            :rules="rules"
            label-width="80px"
            :inline="true"
            size="small"
          >
            <el-form-item prop="title" label="标题">
              <el-input v-model="database.title"></el-input>
            </el-form-item>
            <el-form-item prop="content" label="内容">
              <el-input v-model="database.content"></el-input>
            </el-form-item>
          </el-form>
        </div>
      </system-dialog>
    </el-main>
  </el-container>
</template>
<script>
//导入部门api脚本
import departmentApi from "@/api/department";
//导入用户api脚本
import databaseApi from "@/api/database";
//导入对话框组件
import SystemDialog from "@/components/system/SystemDialog.vue";
export default {
  name: "databaseList",
  components: {
    SystemDialog,
  },
  data() {
    return {
      containerHeight: 0, //容器高度
      deptList: [], //左侧部门树形菜单列表
      //树节点属性
      defaultProps: {
        children: "children",
        label: "departmentName",
      },
      databaseList: [],
      //查询条件对象
      searchModel: {
        title: "",
        content: "",
        departmentId: "",
        pageNo: 1,
        pageSize: 10,
      },
      tableHeight: 0, //表格高度
      pageNo: 1, //当前页码
      pageSize: 10, //每页显示数量
      total: 0, //总数量
      departmentId: "", //部门编号
      //添加和修改用户窗口属性
      databaseDialog: {
        title: "",
        height: 410,
        width: 610,
        visible: false,
      },
      //用户对象
      database: {
        id: "",
        title: "",
        username: "",
        content: "",
        departmentId: "",
        createTime: "",
      },
      rules: {
        title: [{ required: true, trigger: "blur", message: "请输入标题" }],
        content: [{ required: true, trigger: "blur", message: "请输入内容" }],
      },
      userId: this.$store.getters.userId,
      username: this.$store.getters.name,
    };
  },
  methods: {
    /**
     * 查询部门列表
     */
    async getDeptList() {
      //发送查询请求
      let res = await departmentApi.getDepartmentList(null);
      //判断是否成功
      if (res.success) {
        this.deptList = res.data;
        //树加载完成后，默认点击第一个节点
        this.$nextTick(() => {
          const firstNode = document.querySelector(".el-tree-node");
          firstNode.click();
        });
      }
    },
    /**
     * 左侧树节点点击事件
     */
    handleNodeClick(data) {
      //给部门编号赋值
      this.departmentId = data.id;
      //查询数据
      this.search(this.departmentId, (this.pageNo = 1), (this.pageSize = 10));
    },
    //加减号图标点击事件
    openBtn(data) {
      //修改折叠展开状态
      data.open = !data.open;
      this.$refs.leftTree.store.nodesMap[data.id].expanded = !data.open;
    },
    /**
     * 查询数据列表
     */
    async search(departmentId, pageNo = 1, pageSize = 10) {
      this.searchModel.pageNo = pageNo;
      this.searchModel.pageSize = pageSize;
      this.searchModel.departmentId = departmentId;
      //发送查询请求
      let res = await databaseApi.getDatabaseList(this.searchModel);
      if (res.success) {
        this.databaseList = res.data.records;
        this.total = res.data.total;
      }
    },
    /**
     * 当每页数量发生变化时触发该事件
     */
    handleSizeChange(size) {
      this.pageSize = size; //将每页显示的数量交给成员变量
      this.search(this.departmentId, this.pageNo, size);
    },
    /**
     * 当页码发生变化时触发该事件
     */
    handleCurrentChange(page) {
      this.pageNo = page;
      //调用查询方法
      this.search(this.departmentId, page, this.pageSize);
    },
    /**
     * 重置查询条件
     */
    resetValue() {
      //清空查询条件
      this.searchModel = {
        title: "",
        content: "",
        departmentId: "",
        pageNo: 1,
        pageSize: 10,
      };
      //重新查询
      this.search(this.departmentId);
    },
    /**
     * 新增或编辑取消事件
     */
    onClose() {
      this.databaseDialog.visible = false; //关闭窗口
    },
    /**
     * 新增或编辑确认事件
     */
    onConfirm() {
      this.$refs.databaseForm.validate(async (valid) => {
        if (valid) {
          let res = null;
          //判断用户ID是否为空
          if (this.database.id === "") {
            //新增
            //发送添加请求
            res = await databaseApi.addDatabase(this.database);
          } else {
            //发送修改请求
            res = await databaseApi.updateDatabase(this.database);
          }
          //判断是否成功
          if (res.success) {
            this.$message.success(res.message);
            //刷新
            this.search(this.departmentId, this.pageNo, this.pageSize);
            //关闭窗口
            this.databaseDialog.visible = false;
          } else {
            this.$message.error(res.message);
          }
        }
      });
    },
    /**
     * 打开添加窗口
     */
    async openAddWindow() {
      let res = await databaseApi.getDepIdByUserId({ id: this.userId });
      if (res.data != this.departmentId) {
        this.$message.error("不属于该部门，不能新增");
        return;
      }
      this.$resetForm("databaseForm", this.database); //清空表单
      this.databaseDialog.visible = true; //显示窗口
      this.databaseDialog.title = "新增数据"; //设置标题
      this.database.createTime = new Date();
      this.database.username = this.username;
      this.database.departmentId = res.data;
    },
    /**
     * 编辑用户
     */
    handleEdit(row) {
      if (this.username != row.username) {
        this.$message.error("不是自己发布的不能编辑");
        return;
      }
      //设置弹框属性
      this.databaseDialog.title = "编辑用户";
      this.databaseDialog.visible = true;
      //把当前编辑的数据复制到表单数据域，供回显使用
      this.$objCopy(row, this.database);
    },
    /**
     * 删除
     */
    async handleDelete(row) {
      if (row.username != this.username) {
        this.$message.error("不是自己的，不能删除");
        return;
      }
      let confirm = await this.$myconfirm("确定要删除该数据吗?");
      if (confirm) {
        //封装条件
        let params = { id: row.id };
        //发送删除请求
        let res = await databaseApi.deleteDatabase(params);
        //判断是否成功
        if (res.success) {
          this.$message.success(res.message);
          //刷新
          this.search(this.departmentId, this.pageNo, this.pageSize);
        } else {
          this.$message.error(res.message);
        }
      }
    },
  },
  created() {
    //查询部门列表
    this.getDeptList();
    //调用查询用户列表
    this.search(this.departmentId);
  },
  mounted() {
    this.$nextTick(() => {
      //容器高度
      this.containerHeight = window.innerHeight - 85;
      //表格高度
      this.tableHeight = window.innerHeight - 220;
    });
  },
};
</script>

<style lang="scss">
::v-deep .el-tree {
  .el-tree-node {
    position: relative;
    padding-left: 10px;
  }
  .el-tree-node__children {
    padding-left: 20px;
  }
  .el-tree-node :last-child:before {
    height: 40px;
  }
  .el-tree > .el-tree-node:before {
    border-left: none;
  }
  .el-tree > .el-tree-node:after {
    border-top: none;
  }
  .el-tree-node:before,
  .el-tree-node:after {
    content: "";
    left: -4px;
    position: absolute;
    right: auto;
    border-width: 1px;
  }
  .tree :first-child .el-tree-node:before {
    border-left: none;
  }
  .el-tree-node:before {
    border-left: 1px dotted #d9d9d9;
    bottom: 0px;
    height: 100%;
    top: -25px;
    width: 1px;
  }
  .el-tree-node:after {
    border-top: 1px dotted #d9d9d9;
    height: 20px;
    top: 14px;
    width: 24px;
  }
  .el-tree-node__expand-icon.is-leaf {
    width: 8px;
  }
  .el-tree-node__content > .el-tree-node__expand-icon {
    display: none;
  }
  .el-tree-node__content {
    line-height: 30px;
    height: 30px;
    padding-left: 10px !important;
  }
}
::v-deep .el-tree > div {
  &::before {
    display: none;
  }
  &::after {
    display: none;
  }
}
</style>
