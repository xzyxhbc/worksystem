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
        <el-input v-model="searchModel.title" placeholder="请输入博客标题" />
      </el-form-item>
      <el-form-item>
        <el-input v-model="searchModel.username" placeholder="请输入作者名" />
      </el-form-item>
      <el-form-item>
        <el-input v-model="searchModel.content" placeholder="请输入博客内容" />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          @click="search(pageNo, pageSize)"
          >查询</el-button
        >
        <el-button icon="el-icon-refresh-right" @click="resetValue()"
          >重置</el-button
        >
        <el-button type="success" icon="el-icon-plus" @click="openAddWindow()"
          >新增</el-button
        >
      </el-form-item>
    </el-form>
    <!-- 数据表格 -->
    <el-table
      :data="blogList"
      :height="tableHeight"
      border
      stripe
      style="width: 100%; margin-bottom: 10px"
    >
      <el-table-column
        prop="id"
        label="博客编号"
        width="100"
        align="center"
      ></el-table-column>
      <el-table-column prop="title" label="博客标题"></el-table-column>
      <el-table-column prop="username" label="博客作者"></el-table-column>
      <el-table-column prop="precis" label="博客简介"></el-table-column>
      <el-table-column label="阅读" align="center" width="290">
        <template slot-scope="scope">
          <el-button
            icon="el-icon-view"
            type="success"
            size="small"
            @click="handleView(scope.row)"
            >查看</el-button
          >
          <el-button
            icon="el-icon-star-off"
            type="warning"
            size="small"
            @click="handleEnjoy(scope.row)"
            >点赞 {{ scope.row.likeNum }}</el-button
          >
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="290">
        <template slot-scope="scope">
          <el-button
            icon="el-icon-edit"
            type="primary"
            size="small"
            @click="handleEdit(scope.row)"
            >编辑</el-button
          >
          <el-button
            icon="el-icon-delete"
            type="danger"
            size="small"
            @click="deleteBlog(scope.row)"
            >删除</el-button
          >
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
    <!-- 添加和编辑博客窗口 -->
    <system-dialog
      :title="blogDialog.title"
      :height="blogDialog.height"
      :width="blogDialog.width"
      :visible="blogDialog.visible"
      @onClose="onClose"
      @onConfirm="onConfirm"
    >
      <div slot="content">
        <el-form
          :model="blog"
          ref="blogForm"
          :rules="rules"
          label-width="80px"
          :inline="true"
          size="small"
          v-if="blogDialog.type == 1"
        >
          <el-form-item prop="title" label="标题">
            <el-input v-model="blog.title" :readonly="true"></el-input>
          </el-form-item>
          <el-form-item prop="username" label="作者">
            <el-input v-model="blog.username" :readonly="true"></el-input>
          </el-form-item>
          <el-form-item prop="precis" label="简介" class="precis-input-size">
            <el-input v-model="blog.precis" :readonly="true"></el-input>
          </el-form-item>
          <el-form-item prop="content" label="内容">
            <el-card style="height: 400px">
              <quill-editor
                v-model="blog.content"
                ref="myQuillEditor"
                style="height: 500px"
                @focus="focus($event)"
                :options="editorOption"
              >
              </quill-editor>
            </el-card>
          </el-form-item>
          <el-form-item prop="createTime" label="创建时间">
            <el-input v-model="blog.createTime" :readonly="true"></el-input>
          </el-form-item>
          <el-form-item prop="updateTime" label="更新时间">
            <el-input v-model="blog.updateTime" :readonly="true"></el-input>
          </el-form-item>
          <h2>评论区</h2>
          <!-- 评论输入表单项 -->
          <el-form-item label="添加评论">
            <el-input
              type="textarea"
              :rows="3"
              v-model="comment.content"
              placeholder="输入评论内容"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :disabled="comment.content.trim() === ''"
              @click="addComment()"
              >添加</el-button
            >
          </el-form-item>
          <!--评论表格-->
          <el-table :data="commentList" style="width: 100%">
            <el-table-column prop="createTime" label="日期" width="180">
            </el-table-column>
            <el-table-column prop="username" label="用户名" width="180">
            </el-table-column>
            <el-table-column prop="content" label="内容"> </el-table-column>
            <el-table-column label="操作" align="center" width="290">
              <template slot-scope="scope">
                <el-button
                  icon="el-icon-delete"
                  type="danger"
                  size="small"
                  @click="commentDelete(scope.row)"
                  >删除</el-button
                ></template
              >
            </el-table-column>
          </el-table>
        </el-form>
        <el-form
          :model="blog"
          ref="blogForm"
          :rules="rules"
          label-width="80px"
          :inline="true"
          size="small"
          v-if="blogDialog.type != 1"
        >
          <el-form-item prop="title" label="标题">
            <el-input v-model="blog.title"></el-input>
          </el-form-item>
          <el-form-item prop="precis" label="简介">
            <el-input v-model="blog.precis"></el-input>
          </el-form-item>
          <el-card style="height: 400px">
            <quill-editor
              v-model="blog.content"
              ref="myQuillEditor"
              style="height: 500px"
              :options="editorOption"
            >
            </quill-editor>
          </el-card>
        </el-form>
      </div>
    </system-dialog>
  </el-main>
</template>
    
<script>
//导入blog.js脚本
import blogApi from "@/api/blog";
import commentApi from "@/api/comment";
import { quillEditor } from "vue-quill-editor";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";
//导入对话框组件
import SystemDialog from "@/components/system/SystemDialog.vue";
export default {
  name: "blogList",
  //注册组件
  components: {
    SystemDialog,
    quillEditor,
  },
  data() {
    return {
      //查询条件
      searchModel: {
        pageNo: 1,
        pageSize: 10,
        userId: this.$store.getters.userId, //用户ID
        title: "", // 博客标题
        username: "", // 作者名
        precis: "", // 简介
      },
      //博客对象
      blog: {
        id: "",
        title: "",
        precis: "",
        content: "",
        userId: "",
        username: "",
        createTime: "",
        updateTime: "",
        likeNum: "",
      },
      pageNo: 1, //当前页码
      pageSize: 10, //每页显示数量
      total: 0, //总数量
      blogList: [], // 博客列表
      tableHeight: 0, //表格高度
      //添加和修改博客窗口属性
      blogDialog: {
        title: "",
        height: 710,
        width: 810,
        visible: false,
        type: "",
      },
      rules: {
        title: [{ required: true, trigger: "change", message: "请输入标题" }],
        precis: [{ required: true, trigger: "blur", message: "请输入简介" }],
        content: [{ required: true, trigger: "blur", message: "请输入内容" }],
      },
      editorOption: {},
      commentList: [], // 评论列表
      // 评论对象
      comment: {
        id: "",
        content: "",
        username: "",
        blogId: "",
        createTime: "",
      },
    };
  },
  methods: {
    //获取焦点事件
    focus(event) {
      event.enable(false); //设置富文本编辑器不可编辑
    },
    /**
     * 查询
     */
    async search(pageNo = 1, pageSize = 10) {
      this.searchModel.pageNo = pageNo; //当前页码
      this.searchModel.pageSize = pageSize; //每页显示数量
      //发送查询请求
      let res = await blogApi.getBlogListApi(this.searchModel);
      //执行成功
      if (res.success) {
        //博客列表
        this.blogList = res.data.records;
        //总数量
        this.total = res.data.total;
      }
    },
    /**
     * 当每页数量发生变化时触发该事件
     */
    handleSizeChange(size) {
      this.pageSize = size; //将每页显示的数量交给成员变量
      this.search(this.pageNo, size);
    },
    /**
     * 当页码发生变化时触发该事件
     */
    handleCurrentChange(page) {
      this.pageNo = page;
      //调用查询方法
      this.search(page, this.pageSize);
    },
    /**
     * 重置查询条件
     */
    resetValue() {
      //清空查询条件
      this.searchModel = {
        pageNo: 1,
        pageSize: 10,
        userId: "", //用户ID
        title: "",
        username: "",
        precis: "",
      };
      //重新查询
      this.search(1, 10);
    },
    /**
     * 点赞
     */
    async handleEnjoy(row) {
      //封装条件
      let params = { id: row.id };
      let res = await blogApi.enjoyBlogApi(params);
      //判断是否成功
      if (res.success) {
        this.$message.success(res.message);
        //刷新
        this.search(this.pageNo, this.pageSize);
      } else {
        this.$message.error(res.message);
      }
    },
    /**
     * 新增博客
     */
    openAddWindow() {
      this.$resetForm("blogForm", this.blog); //清空表单数据
      this.blogDialog.title = "新增博客"; //设置窗口标题
      this.blog.createTime = new Date();
      (this.blog.username = this.$store.getters.name), //用户名
        (this.blogDialog.type = 3);
      this.blogDialog.visible = true; //显示窗口
    },
    /**
     * 查询评论
     */
    async searchComment(params) {
      let res = await commentApi.getCommentListApi(params);
      //执行成功
      if (res.success) {
        //博客列表
        this.commentList = res.data;
      }
    },
    /**
     * 查看博客详情
     * @param  row
     */
    async handleView(row) {
      this.blogDialog.title = "博客详情"; //设置标题
      this.blogDialog.type = 1;
      this.blogDialog.visible = true; //显示窗口
      //把当前编辑的数据复制到表单数据域，供回显使用
      this.$objCopy(row, this.blog);
      //发送查询请求
      let params = { id: this.blog.id };
      this.searchComment(params);
    },
    /**
     * 编辑博客
     * @param  row
     */
    handleEdit(row) {
      let res = this.$store.getters.name;
      if (row.username != res) {
        this.$message.error("不是自己的博客，不能编辑");
        return;
      }
      this.blogDialog.title = "博客编辑"; //设置标题
      this.blogDialog.type = 2;
      this.blogDialog.visible = true; //显示窗口
      //把当前编辑的数据复制到表单数据域，供回显使用
      this.$objCopy(row, this.blog);
      this.blog.updateTime = new Date();
    },
    /**
     * 新增或编辑取消事件
     */
    onClose() {
      this.blogDialog.visible = false; //关闭窗口
    },
    /**
     * 新增或编辑确认事件
     */
    onConfirm() {
      this.$refs.blogForm.validate(async (valid) => {
        if (valid) {
          let res = null;
          //判断操作类型
          if (this.blogDialog.type === 3) {
            //新增
            //发送添加请求
            res = await blogApi.addBlogApi(this.blog);
          } else if (this.blogDialog.type === 2) {
            //发送修改请求
            res = await blogApi.updateBlogApi(this.blog);
          } else if (this.blogDialog.type === 1) {
            res = { code: 200, message: "执行成功", success: true };
          }
          //判断是否成功
          if (res.success) {
            this.$message.success(res.message);
            //刷新
            this.search(this.pageNo, this.pageSize);
            //关闭窗口
            this.blogDialog.visible = false;
          } else {
            this.$message.error(res.message);
          }
        }
      });
    },
    /**
     * 删除博客
     */
    async deleteBlog(row) {
      let res = this.$store.getters.name;
      if (row.username != res) {
        this.$message.error("不是自己的博客，不能删除");
        return;
      }
      //确认是否删除
      let confirm = await this.$myconfirm("确定要删除该博客吗?");
      if (confirm) {
        //发送删除请求
        let res = await blogApi.deleteBlogApi({ id: row.id });
        //判断是否成功
        if (res.success) {
          //成功提示
          this.$message.success(res.message);
          //刷新
          this.search(this.pageNo, this.pageSize);
        } else {
          //失败提示
          this.$message.error(res.message);
        }
      }
    },
    /**
     * 删除评论
     * @param row
     */
    async commentDelete(row) {
      let res = this.$store.getters.name;
      if (row.username != res && this.blog.username != res) {
        this.$message.error("不是自己的评论并且您不是博客作者，不能删除");
        return;
      }
      //确认是否删除
      let confirm = await this.$myconfirm("确定要删除该评论吗?");
      if (confirm) {
        //发送删除请求
        let res = await commentApi.deleteCommentApi({ id: row.id });
        //判断是否成功
        if (res.success) {
          //成功提示
          this.$message.success(res.message);
          //刷新
          this.searchComment({ id: this.blog.id });
        } else {
          //失败提示
          this.$message.error(res.message);
        }
      }
    },
    /**
     * 添加评论
     */
    async addComment() {
      this.comment.username = this.$store.getters.name;
      this.comment.blogId = this.blog.id;
      this.comment.createTime = new Date();
      let res = await commentApi.addCommentApi(this.comment);
      //判断是否成功
      if (res.success) {
        this.$message.success(res.message);
        //刷新
        this.searchComment({ id: this.blog.id });
      } else {
        this.$message.error(res.message);
      }
    },
  },
  created() {
    //调用查询博客列表的方法
    this.search();
  },
  mounted() {
    this.$nextTick(() => {
      this.tableHeight = window.innerHeight - 220;
    });
  },
};
</script>

<style lang="scss" scoped>
.precis-input-size {
  width: 500px; /* 设置你想要的宽度 */
  // height: 500px;
}
.content-input-size {
  width: 500px; /* 设置你想要的宽度 */
  // height: 500px;
}
</style>
    