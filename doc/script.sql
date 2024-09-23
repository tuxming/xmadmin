/*
 Navicat Premium Data Transfer

 Source Server         : local
 Source Server Type    : MySQL
 Source Server Version : 80200 (8.2.0)
 Source Host           : localhost:3306
 Source Schema         : xmadmin

 Target Server Type    : MySQL
 Target Server Version : 80200 (8.2.0)
 File Encoding         : 65001

 Date: 23/09/2024 12:31:33
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for sys_dept
-- ----------------------------
DROP TABLE IF EXISTS `sys_dept`;
CREATE TABLE `sys_dept`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '组织显示名',
  `parent_id` int NOT NULL DEFAULT 0 COMMENT '上级名称',
  `path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '组织路径',
  `path_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '组织名称路径',
  `type` int NOT NULL DEFAULT 0 COMMENT '组织类型：0-个人，1-小组，2-部门，3-公司，4-集团',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 36 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin COMMENT = '组织结构' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_dept
-- ----------------------------
INSERT INTO `sys_dept` VALUES (1, '系统', 0, '/1/', '/系统/', 0);
INSERT INTO `sys_dept` VALUES (4, '深圳总部', 32, '/1/32/4/', '/系统/XX公司/深圳总部/', 4);
INSERT INTO `sys_dept` VALUES (5, '董事会', 4, '/1/32/4/4/5/', '/系统/XX公司/深圳总部/董事会/', 2);
INSERT INTO `sys_dept` VALUES (6, '财务部', 19, '/1/32/4/4/19/6/', '/系统/XX公司/深圳总部/行政部/财务部/', 2);
INSERT INTO `sys_dept` VALUES (7, '人力资源部', 19, '/1/32/4/4/19/7/', '/系统/XX公司/深圳总部/行政部/人力资源部/', 2);
INSERT INTO `sys_dept` VALUES (8, '业务部', 4, '/1/32/4/4/8/', '/系统/XX公司/深圳总部/业务部/', 2);
INSERT INTO `sys_dept` VALUES (14, '党委会', 5, '/1/32/4/4/5/14/', '/系统/XX公司/深圳总部/董事会/党委会/', 2);
INSERT INTO `sys_dept` VALUES (15, '监事会', 5, '/1/32/4/4/5/15/', '/系统/XX公司/深圳总部/董事会/监事会/', 2);
INSERT INTO `sys_dept` VALUES (16, '综合服务部', 4, '/1/32/4/4/16/', '/系统/XX公司/深圳总部/综合服务部/', 2);
INSERT INTO `sys_dept` VALUES (17, '经理办公室', 16, '/1/32/4/4/16/17/', '/系统/XX公司/深圳总部/综合服务部/经理办公室/', 1);
INSERT INTO `sys_dept` VALUES (18, '董事办公室', 16, '/1/32/4/4/16/18/', '/系统/XX公司/深圳总部/综合服务部/董事办公室/', 1);
INSERT INTO `sys_dept` VALUES (19, '行政部', 4, '/1/32/4/4/19/', '/系统/XX公司/深圳总部/行政部/', 2);
INSERT INTO `sys_dept` VALUES (20, '法务部', 19, '/1/32/4/4/19/20/', '/系统/XX公司/深圳总部/行政部/法务部/', 2);
INSERT INTO `sys_dept` VALUES (21, '行政部', 19, '/1/32/4/4/19/21/', '/系统/XX公司/深圳总部/行政部/行政部/', 2);
INSERT INTO `sys_dept` VALUES (22, '渠道部', 8, '/1/32/4/4/8/22/', '/系统/XX公司/深圳总部/业务部/渠道部/', 2);
INSERT INTO `sys_dept` VALUES (23, '电商部', 8, '/1/32/4/4/8/23/', '/系统/XX公司/深圳总部/业务部/电商部/', 2);
INSERT INTO `sys_dept` VALUES (24, '大客服业务部', 8, '/1/32/4/4/8/24/', '/系统/XX公司/深圳总部/业务部/大客服业务部/', 2);
INSERT INTO `sys_dept` VALUES (25, '零售部', 8, '/1/32/4/4/8/25/', '/系统/XX公司/深圳总部/业务部/零售部/', 2);
INSERT INTO `sys_dept` VALUES (26, '采购部', 4, '/1/32/4/4/26/', '/系统/XX公司/深圳总部/采购部/', 2);
INSERT INTO `sys_dept` VALUES (27, '行政办公采购部', 26, '/1/32/4/4/26/27/', '/系统/XX公司/深圳总部/采购部/行政办公采购部/', 2);
INSERT INTO `sys_dept` VALUES (28, '供应链管理部', 26, '/1/32/4/4/26/28/', '/系统/XX公司/深圳总部/采购部/供应链管理部/', 2);
INSERT INTO `sys_dept` VALUES (29, '技术部', 4, '/1/32/4/4/29/', '/系统/XX公司/深圳总部/技术部/', 2);
INSERT INTO `sys_dept` VALUES (30, '维护部', 29, '/1/32/4/4/29/30/', '/系统/XX公司/深圳总部/技术部/维护部/', 2);
INSERT INTO `sys_dept` VALUES (31, '研发部', 29, '/1/32/4/4/29/31/', '/系统/XX公司/深圳总部/技术部/研发部/', 2);
INSERT INTO `sys_dept` VALUES (32, 'XX公司', 1, '/1/32/', '/系统/XX公司/', 4);
INSERT INTO `sys_dept` VALUES (33, '广州分公司', 32, '/1/32/33/', '/系统/XX公司/广州分公司/', 3);
INSERT INTO `sys_dept` VALUES (34, '业务部', 33, '/1/32/33/34', '/系统/XX公司/广州分公司/业务部', 2);
INSERT INTO `sys_dept` VALUES (35, '技术部', 33, '/1/32/33/35', '/系统/XX公司/广州分公司/技术部', 2);

-- ----------------------------
-- Table structure for sys_dict
-- ----------------------------
DROP TABLE IF EXISTS `sys_dict`;
CREATE TABLE `sys_dict`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '分类名',
  `dict_key` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT 'key',
  `dict_value` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '值',
  `dict_label` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '显示名',
  `type` int NOT NULL DEFAULT 0 COMMENT '值类型：0-文本，1-数值，3-图片id,  4-json',
  `remark` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '附加值',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_group_name`(`group_name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 44 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin COMMENT = '字典表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_dict
-- ----------------------------
INSERT INTO `sys_dict` VALUES (8, 'Company', 'name', 'Xm-Admin', 'Xm-Admin', 0, '');
INSERT INTO `sys_dict` VALUES (9, 'Company', 'logo', '1051', 'Logo', 3, '');
INSERT INTO `sys_dict` VALUES (24, 'UserStatus', '0', '0', '待审核', 1, 'orange');
INSERT INTO `sys_dict` VALUES (25, 'UserStatus', '1', '1', '正常', 1, '#87d068');
INSERT INTO `sys_dict` VALUES (26, 'UserStatus', '2', '2', '禁用', 1, 'volcano');
INSERT INTO `sys_dict` VALUES (27, 'UserStatus', '3', '3', '删除', 1, '#f50');
INSERT INTO `sys_dict` VALUES (28, 'DeptType', '0', '0', '个人', 1, 'purple');
INSERT INTO `sys_dict` VALUES (29, 'DeptType', '1', '1', '小组', 1, 'gold');
INSERT INTO `sys_dict` VALUES (30, 'DeptType', '2', '2', '部门', 1, 'cyan');
INSERT INTO `sys_dict` VALUES (31, 'DeptType', '3', '3', '公司', 1, 'lime');
INSERT INTO `sys_dict` VALUES (32, 'DeptType', '4', '4', '集团', 1, '#108ee9');
INSERT INTO `sys_dict` VALUES (33, 'MenuType', '0', '0', '目录', 1, '');
INSERT INTO `sys_dict` VALUES (34, 'MenuType', '1', '1', '菜单', 1, '');
INSERT INTO `sys_dict` VALUES (35, 'MenuStatus', '0', '0', '正常', 1, '');
INSERT INTO `sys_dict` VALUES (36, 'MenuStatus', '1', '1', '禁用', 1, '');
INSERT INTO `sys_dict` VALUES (37, 'RoleType', '0', '0', '系统管理员', 1, 'purple');
INSERT INTO `sys_dict` VALUES (38, 'RoleType', '1', '1', '超级管理员', 1, 'gold');
INSERT INTO `sys_dict` VALUES (39, 'RoleType', '2', '2', '管理员', 1, 'cyan');
INSERT INTO `sys_dict` VALUES (40, 'RoleType', '3', '3', '普通角色', 1, 'lime');
INSERT INTO `sys_dict` VALUES (41, 'Gender', '0', '0', '男', 1, '#2db7f5');
INSERT INTO `sys_dict` VALUES (42, 'Gender', '1', '1', '女', 1, '#87d068');
INSERT INTO `sys_dict` VALUES (43, 'Gender', '2', '2', '保密', 1, 'magenta');

-- ----------------------------
-- Table structure for sys_dict_group
-- ----------------------------
DROP TABLE IF EXISTS `sys_dict_group`;
CREATE TABLE `sys_dict_group`  (
  `code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '字典值',
  `label` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '显示名',
  `remark` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '字典分类说明',
  PRIMARY KEY (`code`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin COMMENT = '字典分类表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_dict_group
-- ----------------------------
INSERT INTO `sys_dict_group` VALUES ('Company', '系统信息设置', '');
INSERT INTO `sys_dict_group` VALUES ('DeptType', '组织类型', '');
INSERT INTO `sys_dict_group` VALUES ('Gender', '性别', '');
INSERT INTO `sys_dict_group` VALUES ('MenuStatus', '菜单状态', '');
INSERT INTO `sys_dict_group` VALUES ('MenuType', '菜单类型', '');
INSERT INTO `sys_dict_group` VALUES ('RoleType', '角色类型', '');
INSERT INTO `sys_dict_group` VALUES ('UserStatus', '用户状态', '');

-- ----------------------------
-- Table structure for sys_document
-- ----------------------------
DROP TABLE IF EXISTS `sys_document`;
CREATE TABLE `sys_document`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `file_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '文件名',
  `path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '文件路径',
  `created` datetime NOT NULL COMMENT '创建时间',
  `user_id` int NOT NULL DEFAULT 0 COMMENT '创建人',
  `type` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '文件类型',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '文件说明',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_type`(`type` ASC) USING BTREE,
  INDEX `idx_user`(`user_id` ASC) USING BTREE,
  INDEX `idx_filename`(`file_name` ASC) USING BTREE,
  INDEX `ifx_created`(`created` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1083 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin COMMENT = '文件信息' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_document
-- ----------------------------
INSERT INTO `sys_document` VALUES (1051, 'logo192.png', '/1/common/1724755261111008.png', '2024-08-27 18:41:01', 1, 'common', '');
INSERT INTO `sys_document` VALUES (1052, '2-OOfSf4-77_0.jpg', '/1/common/1725109644436034.jpg', '2024-08-31 21:07:25', 1, 'common', '');
INSERT INTO `sys_document` VALUES (1081, '47_3.jpg', '/1/photo/1725690757042089.jpg', '2024-09-07 14:32:37', 1, 'photo', '');
INSERT INTO `sys_document` VALUES (1082, '0_0.jpg', '/144/common/1727020870309095.jpg', '2024-09-23 00:01:10', 144, 'common', '');

-- ----------------------------
-- Table structure for sys_history
-- ----------------------------
DROP TABLE IF EXISTS `sys_history`;
CREATE TABLE `sys_history`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL DEFAULT 0 COMMENT '操作人',
  `username` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '操作人名',
  `ip_addr` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT 'ip地址',
  `type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '操作类型',
  `created` datetime NOT NULL COMMENT '操作时间',
  `remark` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '请求参数',
  `seq` int NOT NULL DEFAULT 0 COMMENT '序号，当一个请求的参数过长时，会分成多段存储起来',
  `history_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT 'id: 当一个请求过长是，这个多个存储使用这一个id',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user`(`user_id` ASC) USING BTREE,
  INDEX `idx_created`(`created` ASC) USING BTREE,
  INDEX `idx_type`(`type` ASC) USING BTREE,
  INDEX `idx_history_id`(`history_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 305 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin COMMENT = '日志表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_history
-- ----------------------------

-- ----------------------------
-- Table structure for sys_language
-- ----------------------------
DROP TABLE IF EXISTS `sys_language`;
CREATE TABLE `sys_language`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '显示名',
  `code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '语言代码',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_code`(`code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin COMMENT = '国际化支持的语言列表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_language
-- ----------------------------
INSERT INTO `sys_language` VALUES (1, '简体中文', 'zh_CN');
INSERT INTO `sys_language` VALUES (2, '繁体中文', 'zh_TW');
INSERT INTO `sys_language` VALUES (3, 'English', 'en');

-- ----------------------------
-- Table structure for sys_language_resource
-- ----------------------------
DROP TABLE IF EXISTS `sys_language_resource`;
CREATE TABLE `sys_language_resource`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `language_id` int NOT NULL DEFAULT 0 COMMENT '所属语言',
  `category` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '默认' COMMENT '所属分类',
  `res_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'key值',
  `res_value` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '翻译后的文本',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_key`(`language_id` ASC, `category` ASC, `res_key` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 666 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin COMMENT = '语言资源' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_language_resource
-- ----------------------------

-- ----------------------------
-- Table structure for sys_language_resource_group
-- ----------------------------
DROP TABLE IF EXISTS `sys_language_resource_group`;
CREATE TABLE `sys_language_resource_group`  (
  `name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`name`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_language_resource_group
-- ----------------------------
INSERT INTO `sys_language_resource_group` VALUES ('AdminDept');
INSERT INTO `sys_language_resource_group` VALUES ('AdminDict');
INSERT INTO `sys_language_resource_group` VALUES ('AdminDocument');
INSERT INTO `sys_language_resource_group` VALUES ('AdminHistory');
INSERT INTO `sys_language_resource_group` VALUES ('AdminHome');
INSERT INTO `sys_language_resource_group` VALUES ('AdminLang');
INSERT INTO `sys_language_resource_group` VALUES ('AdminLogin');
INSERT INTO `sys_language_resource_group` VALUES ('AdminMenu');
INSERT INTO `sys_language_resource_group` VALUES ('AdminPermission');
INSERT INTO `sys_language_resource_group` VALUES ('AdminRole');
INSERT INTO `sys_language_resource_group` VALUES ('AdminSkinSetting');
INSERT INTO `sys_language_resource_group` VALUES ('AdminUser');
INSERT INTO `sys_language_resource_group` VALUES ('translation');

-- ----------------------------
-- Table structure for sys_menu
-- ----------------------------
DROP TABLE IF EXISTS `sys_menu`;
CREATE TABLE `sys_menu`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `parent_id` int NOT NULL DEFAULT 0 COMMENT '上级节点id, 顶级为0',
  `name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '菜单名',
  `sort` int NOT NULL DEFAULT 0 COMMENT '显示顺序，从小到大排序',
  `path` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '菜单跳转链接',
  `query` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '附加参数',
  `type` tinyint NOT NULL DEFAULT 0 COMMENT '类型：0-目录，1-菜单',
  `status` tinyint NOT NULL DEFAULT 0 COMMENT '状态：0-正常，1-禁用',
  `icon` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '菜单图标',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_parent`(`parent_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 31 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin COMMENT = '菜单权限表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_menu
-- ----------------------------
INSERT INTO `sys_menu` VALUES (1, 0, '后台菜单', 0, '', '', 0, 0, 'icon-dizhi');
INSERT INTO `sys_menu` VALUES (2, 1, '主面板', 0, '/sys', '', 1, 0, 'icon-dashboard');
INSERT INTO `sys_menu` VALUES (4, 1, '角色管理', 2, '/sys/role', '', 1, 0, 'icon-jiaoseguanli');
INSERT INTO `sys_menu` VALUES (5, 1, '菜单管理', 3, '/sys/menu', '', 1, 0, 'icon-menu-s');
INSERT INTO `sys_menu` VALUES (7, 24, '日志管理', 5, '/sys/history', '', 1, 0, 'icon-rizhi');
INSERT INTO `sys_menu` VALUES (8, 24, '文件管理', 6, '/sys/document', '', 1, 0, 'icon-wenjian');
INSERT INTO `sys_menu` VALUES (16, 1, '组织管理', 0, '/sys/dept', '', 1, 0, 'icon-zuzhijiagou');
INSERT INTO `sys_menu` VALUES (18, 24, '语言资源', 11, '/sys/lang', '', 1, 0, 'icon-guojihua');
INSERT INTO `sys_menu` VALUES (19, 24, '字典管理', 12, '/sys/dict', '', 1, 0, 'icon-dict');
INSERT INTO `sys_menu` VALUES (24, 1, '系统管理', 100, '#', '', 0, 0, 'icon-shezhi');
INSERT INTO `sys_menu` VALUES (25, 1, '用户管理', 0, '/sys/user', '', 1, 0, 'icon-user');
INSERT INTO `sys_menu` VALUES (30, 1, '权限管理', 0, '/sys/permission', '', 1, 0, 'icon-quanxian');

-- ----------------------------
-- Table structure for sys_permission
-- ----------------------------
DROP TABLE IF EXISTS `sys_permission`;
CREATE TABLE `sys_permission`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '分组名：防止权限多了不容易区分，使用分组容易区分',
  `name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '权限名',
  `expression` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '权限表达式',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_expression`(`expression` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1527 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin COMMENT = '权限表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_permission
-- ----------------------------
INSERT INTO `sys_permission` VALUES (32, 'system', '删除日志', 'sys:history:delete');
INSERT INTO `sys_permission` VALUES (33, 'system', '查看日志详情', 'sys:history:get');
INSERT INTO `sys_permission` VALUES (34, 'system', '查看日志列表', 'sys:history:list');
INSERT INTO `sys_permission` VALUES (35, 'system', '扫描权限', 'sys:permission:scan');
INSERT INTO `sys_permission` VALUES (36, 'system', '删除权限', 'sys:permission:delete');
INSERT INTO `sys_permission` VALUES (37, 'system', '查看权限', 'sys:permission:get');
INSERT INTO `sys_permission` VALUES (38, 'system', '编辑权限', 'sys:permission:edit');
INSERT INTO `sys_permission` VALUES (39, 'system', '创建权限', 'sys:permission:create');
INSERT INTO `sys_permission` VALUES (40, 'system', '查看权限列表', 'sys:permission:list');
INSERT INTO `sys_permission` VALUES (41, 'system', '删除角色', 'sys:role:delete');
INSERT INTO `sys_permission` VALUES (42, 'system', '编辑角色', 'sys:role:edit');
INSERT INTO `sys_permission` VALUES (43, 'system', '添加角色', 'sys:role:create');
INSERT INTO `sys_permission` VALUES (44, 'system', '角色列表', 'sys:role:list');
INSERT INTO `sys_permission` VALUES (45, 'system', '查看用户信息', 'sys:user:get');
INSERT INTO `sys_permission` VALUES (46, 'system', '用户列表', 'sys:user:list');
INSERT INTO `sys_permission` VALUES (62, 'system', '文档列表', 'sys:doc:list');
INSERT INTO `sys_permission` VALUES (63, 'system', '上传文件', 'sys:doc:upload');
INSERT INTO `sys_permission` VALUES (64, 'system', '删除文档', 'sys:doc:delete');
INSERT INTO `sys_permission` VALUES (68, 'system', '获取菜单列表', 'sys:menu:list');
INSERT INTO `sys_permission` VALUES (110, 'system', '新增菜单', 'sys:menu:update');
INSERT INTO `sys_permission` VALUES (111, 'system', '编辑菜单', 'sys:menu:create');
INSERT INTO `sys_permission` VALUES (146, 'system', '编辑组织', 'sys:dept:update');
INSERT INTO `sys_permission` VALUES (147, 'system', '删除组织', 'sys:dept:delete');
INSERT INTO `sys_permission` VALUES (148, 'system', '创建组织', 'sys:dept:create');
INSERT INTO `sys_permission` VALUES (149, 'system', '组织列表', 'sys:dept:list');
INSERT INTO `sys_permission` VALUES (150, 'system', '更新字典', 'sys:dict:update');
INSERT INTO `sys_permission` VALUES (151, 'system', '删除字典', 'sys:dict:delete');
INSERT INTO `sys_permission` VALUES (152, 'system', '添加字典', 'sys:dict:add');
INSERT INTO `sys_permission` VALUES (153, 'system', '删除字典名', 'sys:dictGroup:delete');
INSERT INTO `sys_permission` VALUES (154, 'system', '新增字典', 'sys:dictGroup:create');
INSERT INTO `sys_permission` VALUES (155, 'system', '更新字典', 'sys:dictGroup:update');
INSERT INTO `sys_permission` VALUES (162, 'system', '保存语言', 'sys:lang:create');
INSERT INTO `sys_permission` VALUES (163, 'system', '删除语言资源', 'sys:res:delete');
INSERT INTO `sys_permission` VALUES (164, 'system', '编辑语言资源', 'sys:res:edit');
INSERT INTO `sys_permission` VALUES (165, 'system', '删除语言', 'sys:lang:delete');
INSERT INTO `sys_permission` VALUES (166, 'system', '更新语言', 'sys:lang:edit');
INSERT INTO `sys_permission` VALUES (256, 'system', '分配数据权限', 'sys:user:grant:data');
INSERT INTO `sys_permission` VALUES (259, 'system', '分配角色', 'sys:user:grant:role');
INSERT INTO `sys_permission` VALUES (263, 'system', '更新用户', 'sys:user:update');
INSERT INTO `sys_permission` VALUES (264, 'system', '删除用户', 'sys:user:delete');
INSERT INTO `sys_permission` VALUES (265, 'system', '创建用户', 'sys:user:create');
INSERT INTO `sys_permission` VALUES (794, 'system', '删除菜单', 'sys:menu:delete');
INSERT INTO `sys_permission` VALUES (807, 'system', '分配权限', 'sys:role:grant:permission');

-- ----------------------------
-- Table structure for sys_role
-- ----------------------------
DROP TABLE IF EXISTS `sys_role`;
CREATE TABLE `sys_role`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '角色名',
  `code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '角色标识，代码一般用它作为判断',
  `type` tinyint NOT NULL COMMENT '角色类型： 用它来判断角色级别的高低：0-sys, 1-super，2-admin普通管理员，3-普通角色，一般建议使用普通角色',
  `creater` int NOT NULL DEFAULT 0 COMMENT '创建人',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_role`(`code` ASC) USING BTREE,
  INDEX `uni_code`(`code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin COMMENT = '角色表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_role
-- ----------------------------
INSERT INTO `sys_role` VALUES (1, '系统', 'system', 0, 1);
INSERT INTO `sys_role` VALUES (2, '管理员', 'super', 1, 1);
INSERT INTO `sys_role` VALUES (3, '普通管理员', 'admin', 2, 1);
INSERT INTO `sys_role` VALUES (4, '普通用户', 'normal', 3, 1);
INSERT INTO `sys_role` VALUES (5, '店长', 'shoper', 3, 1);
INSERT INTO `sys_role` VALUES (11, '员工', 'employee', 3, 1);

-- ----------------------------
-- Table structure for sys_role_menu
-- ----------------------------
DROP TABLE IF EXISTS `sys_role_menu`;
CREATE TABLE `sys_role_menu`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `menu_id` int NOT NULL,
  `role_id` int NOT NULL,
  `checked` tinyint NOT NULL COMMENT '1-半选中， 2-选中，0-未选中',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ref`(`menu_id` ASC, `role_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 16 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin COMMENT = '角色菜单表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_role_menu
-- ----------------------------
INSERT INTO `sys_role_menu` VALUES (1, 25, 11, 2);
INSERT INTO `sys_role_menu` VALUES (5, 4, 4, 2);
INSERT INTO `sys_role_menu` VALUES (6, 5, 4, 2);
INSERT INTO `sys_role_menu` VALUES (7, 25, 4, 2);
INSERT INTO `sys_role_menu` VALUES (9, 16, 4, 2);
INSERT INTO `sys_role_menu` VALUES (10, 8, 4, 2);
INSERT INTO `sys_role_menu` VALUES (12, 24, 4, 1);
INSERT INTO `sys_role_menu` VALUES (13, 8, 11, 2);
INSERT INTO `sys_role_menu` VALUES (14, 24, 11, 1);
INSERT INTO `sys_role_menu` VALUES (15, 2, 4, 2);

-- ----------------------------
-- Table structure for sys_role_permission
-- ----------------------------
DROP TABLE IF EXISTS `sys_role_permission`;
CREATE TABLE `sys_role_permission`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `permission_id` int NOT NULL COMMENT '权限id',
  `role_id` int NOT NULL COMMENT '角色id',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ref`(`permission_id` ASC, `role_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 44 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin COMMENT = '角色权限表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_role_permission
-- ----------------------------
INSERT INTO `sys_role_permission` VALUES (9, 40, 4);
INSERT INTO `sys_role_permission` VALUES (10, 41, 4);
INSERT INTO `sys_role_permission` VALUES (11, 42, 4);
INSERT INTO `sys_role_permission` VALUES (12, 43, 4);
INSERT INTO `sys_role_permission` VALUES (13, 44, 4);
INSERT INTO `sys_role_permission` VALUES (14, 45, 4);
INSERT INTO `sys_role_permission` VALUES (15, 46, 4);
INSERT INTO `sys_role_permission` VALUES (16, 62, 4);
INSERT INTO `sys_role_permission` VALUES (17, 63, 4);
INSERT INTO `sys_role_permission` VALUES (18, 64, 4);
INSERT INTO `sys_role_permission` VALUES (42, 68, 4);
INSERT INTO `sys_role_permission` VALUES (22, 146, 4);
INSERT INTO `sys_role_permission` VALUES (23, 147, 4);
INSERT INTO `sys_role_permission` VALUES (24, 148, 4);
INSERT INTO `sys_role_permission` VALUES (25, 149, 4);
INSERT INTO `sys_role_permission` VALUES (37, 256, 4);
INSERT INTO `sys_role_permission` VALUES (38, 259, 4);
INSERT INTO `sys_role_permission` VALUES (39, 263, 4);
INSERT INTO `sys_role_permission` VALUES (40, 264, 4);
INSERT INTO `sys_role_permission` VALUES (41, 265, 4);
INSERT INTO `sys_role_permission` VALUES (43, 807, 4);

-- ----------------------------
-- Table structure for sys_user
-- ----------------------------
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '账号',
  `fullname` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '姓名',
  `password` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '密码',
  `token` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '授权码',
  `created` datetime NOT NULL COMMENT '创建时间',
  `parent_id` int NOT NULL DEFAULT 0 COMMENT '上级id',
  `code` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '唯一码',
  `gender` tinyint NOT NULL DEFAULT 0 COMMENT '性别：0-男，1-女，2-保密',
  `email` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '电子邮件',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '电话',
  `photo` int NOT NULL DEFAULT 0 COMMENT '照片id',
  `dept_id` int NOT NULL DEFAULT 0 COMMENT '组织id',
  `status` int NOT NULL DEFAULT 1 COMMENT '状态：0-待审核,1-正常,2-禁用，3-删除',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uni_username`(`username` ASC) USING BTREE,
  INDEX `idx_email`(`email` ASC) USING BTREE,
  INDEX `idx_phone`(`phone` ASC) USING BTREE,
  INDEX `idx_parent_id`(`parent_id` ASC) USING BTREE,
  INDEX `idx_dept`(`dept_id` ASC, `id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 145 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin COMMENT = '用户表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_user
-- ----------------------------
INSERT INTO `sys_user` VALUES (1, 'admin', 'admin', '53cdc867bd0553ab64fc5e08597096ec', 'M2ZmZmRiMTQ3Mjg1YTQzNDYwN2I4NTcyYmE2MjNlZTM=', '2024-05-19 22:57:45', 0, 'ADMIN', 0, 'admin@admin.com', '18600001211', 1052, 1, 1);
INSERT INTO `sys_user` VALUES (144, 'tuxming', 'tuxming', '53cdc867bd0553ab64fc5e08597096ec', 'MDM0ZTBlODEtYmY1NC00OGFiLWFiMmMtNjJjNTE4YWUxNDdm', '2024-09-22 09:53:11', 1, '00000144', 2, 'tuxming@sina.com', '', 1081, 34, 1);

-- ----------------------------
-- Table structure for sys_user_data
-- ----------------------------
DROP TABLE IF EXISTS `sys_user_data`;
CREATE TABLE `sys_user_data`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL DEFAULT 0 COMMENT '用户id',
  `ref_id` int NOT NULL COMMENT '引用id: type=1,  为用户id, 2-为组织id',
  `type` int NOT NULL DEFAULT 1 COMMENT '数据权限类型： 1-具体的用户id, 2-组织节点的id',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `uni_ref`(`user_id` ASC, `ref_id` ASC, `type` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin COMMENT = '数据权限	' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_user_data
-- ----------------------------
INSERT INTO `sys_user_data` VALUES (17, 144, 4, 2);
INSERT INTO `sys_user_data` VALUES (16, 144, 144, 1);

-- ----------------------------
-- Table structure for sys_user_role
-- ----------------------------
DROP TABLE IF EXISTS `sys_user_role`;
CREATE TABLE `sys_user_role`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL COMMENT '角色id',
  `user_id` int NOT NULL COMMENT '用户id',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `id_ref`(`role_id` ASC, `user_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin COMMENT = '用户角色表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_user_role
-- ----------------------------
INSERT INTO `sys_user_role` VALUES (10, 3, 89);
INSERT INTO `sys_user_role` VALUES (5, 3, 95);
INSERT INTO `sys_user_role` VALUES (8, 4, 95);
INSERT INTO `sys_user_role` VALUES (16, 4, 143);
INSERT INTO `sys_user_role` VALUES (17, 4, 144);

-- ----------------------------
-- Triggers structure for table sys_user
-- ----------------------------
DROP TRIGGER IF EXISTS `before_insert_user`;
delimiter ;;
CREATE TRIGGER `before_insert_user` BEFORE INSERT ON `sys_user` FOR EACH ROW BEGIN
    DECLARE email_count INT;
    DECLARE phone_count INT;

    -- 检查 email 是否唯一
    IF NEW.email <> '' THEN
        SELECT COUNT(*) INTO email_count FROM sys_user WHERE email = NEW.email;
        IF email_count > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '邮箱已存在';
        END IF;
    END IF;

    -- 检查 phone 是否唯一
    IF NEW.phone <> '' THEN
        SELECT COUNT(*) INTO phone_count FROM sys_user WHERE phone = NEW.phone;
        IF phone_count > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '电话号码已存在';
        END IF;
    END IF;
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table sys_user
-- ----------------------------
DROP TRIGGER IF EXISTS `before_update_user`;
delimiter ;;
CREATE TRIGGER `before_update_user` BEFORE UPDATE ON `sys_user` FOR EACH ROW BEGIN
    DECLARE email_count INT;
    DECLARE phone_count INT;

    -- 检查 email 是否唯一
    IF NEW.email <> '' THEN
        SELECT COUNT(*) INTO email_count FROM sys_user WHERE email = NEW.email AND id != OLD.id;
        IF email_count > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '邮箱已存在';
        END IF;
    END IF;

    -- 检查 phone 是否唯一
    IF NEW.phone <> '' THEN
        SELECT COUNT(*) INTO phone_count FROM sys_user WHERE phone = NEW.phone AND id != OLD.id;
        IF phone_count > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '电话号码已存在';
        END IF;
    END IF;
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
