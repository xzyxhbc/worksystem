<template>
  <div>
    <div style="margin-top: 10px"></div>
    <el-descriptions
      title="个人信息"
      direction="vertical"
      :column="4"
      border
      :data="user"
    >
    <el-descriptions-item label="头像">
      <img :src="user.avatar" style="width: 150px; height: 150px;">
    </el-descriptions-item>
      <el-descriptions-item label="用户名">{{
        user.username
      }}</el-descriptions-item>
      <el-descriptions-item label="真实姓名">{{
        user.realName
      }}</el-descriptions-item>
      <el-descriptions-item label="性别" v-if="user.gender == 0"
        >男</el-descriptions-item
      >
      <el-descriptions-item label="性别" v-if="user.gender == 1"
        >女</el-descriptions-item
      >
      <el-descriptions-item label="所属部门" :span="2">{{
        user.departmentName
      }}</el-descriptions-item>
      <el-descriptions-item label="邮箱">{{ user.email }}</el-descriptions-item>
      <el-descriptions-item label="电话">{{ user.phone }}</el-descriptions-item>
      <el-descriptions-item label="操作">
        <el-button type="primary">编辑</el-button>
      </el-descriptions-item>
    </el-descriptions>
    <div style="margin-top: 10px"></div>
    <el-card shadow="hover" style="width: 100%">
      <div slot="header" class="clearfix">
        <span>文嘉《明日歌》</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="clickFn"
          >暂停</el-button
        >
      </div>
      <div style="font-size: 18px; text-align: center; margin-top: 35px">
        明日复明日
      </div>
      <div style="font-size: 18px; text-align: center">明日何其多</div>
      <div style="font-size: 18px; text-align: center">我生待明日</div>
      <div style="font-size: 18px; text-align: center">万事成蹉跎</div>
      <div style="margin-top: 35px"></div>
      <el-statistic
        ref="statistic"
        @finish="hilarity"
        format="HH:mm:ss"
        :value="deadline"
        title="距离明日："
        time-indices
      >
      </el-statistic>
    </el-card>
  </div>
</template>

<script>
//导入用户api脚本
import userApi from "@/api/user";
export default {
  data() {
    return {
      deadline: Date.now() + (new Date().setHours(23, 59, 59) - Date.now()),
      stop: true,
      //用户对象
      user: {
        id: "",
        departmentId: "",
        departmentName: "",
        email: "",
        realName: "",
        phone: "",
        nickName: "",
        password: "",
        username: "",
        gender: "",
        avatar: "",
        pageNo: "",
        pageSize: "",
      },
    };
  },
  methods: {
    hilarity() {
      this.$notify({
        title: "提示",
        message: "时间已到",
        duration: 0,
      });
    },
    clickFn() {
      this.$refs.statistic.suspend(this.stop);
      this.stop = !this.stop;
    },
    async init() {
      this.user.id = this.$store.getters.userId;
      this.user.pageNo = 1;
      this.user.pageSize = 10;
      let res = (await userApi.getUserList(this.user)).data.records[0];
      console.log(res);
      this.user = res;
    },
  },
  created() {
    this.init();
  },
};
</script>

