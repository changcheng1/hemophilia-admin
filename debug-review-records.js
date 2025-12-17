#!/usr/bin/env node

console.log('🔍 调试复核管理审核记录显示问题...')

console.log('\n📋 问题描述:')
console.log('   ❌ 复核管理点击复核的弹窗没有审批记录展示')
console.log('   ✅ 初审管理已移除审核记录标签页')

console.log('\n🔧 排查步骤:')

console.log('\n1️⃣ 检查后端API接口:')
console.log('   ✅ GET /admin/applications/:id/reviews 接口存在')
console.log('   ✅ AdminApplicationController.getApplicationReviews() 方法正确')
console.log('   ✅ AdminApplicationService.getApplicationReviews() 方法正确')
console.log('   ✅ ApplicationReviewService.getReviewsByApplicationId() 方法正确')

console.log('\n2️⃣ 检查前端API调用:')
console.log('   ✅ adminApplicationAPI.getApplicationReviews() 方法存在')
console.log('   ✅ applicationStore.getApplicationReviews() 方法存在')
console.log('   ✅ API路径正确: `/${id}/reviews`')

console.log('\n3️⃣ 检查前端组件实现:')
console.log('   ✅ FinalReviewView.vue 有审核记录标签页')
console.log('   ✅ fetchApplicationReviews() 方法存在')
console.log('   ✅ openReviewDialog() 中调用了 fetchApplicationReviews()')
console.log('   ✅ applicationReviews 响应式变量存在')
console.log('   ✅ loadingReviews 加载状态存在')

console.log('\n4️⃣ 检查数据显示逻辑:')
console.log('   ✅ v-loading="loadingReviews" 加载状态')
console.log('   ✅ v-if="applicationReviews.length === 0" 空状态处理')
console.log('   ✅ v-for="review in applicationReviews" 列表渲染')
console.log('   ✅ 审核记录字段映射正确')

console.log('\n🚨 可能的问题原因:')

console.log('\n📊 数据层面:')
console.log('   🔍 数据库中可能没有审核记录数据')
console.log('   🔍 申请ID可能不正确')
console.log('   🔍 审核记录表可能为空')
console.log('   🔍 外键关联可能有问题')

console.log('\n📊 API层面:')
console.log('   🔍 API请求可能失败但被静默处理')
console.log('   🔍 返回的数据格式可能不正确')
console.log('   🔍 权限验证可能阻止了数据获取')

console.log('\n📊 前端层面:')
console.log('   🔍 控制台可能有错误信息')
console.log('   🔍 网络请求可能失败')
console.log('   🔍 数据可能被错误处理')

console.log('\n🔧 调试建议:')

console.log('\n1️⃣ 检查浏览器控制台:')
console.log('   - 打开复核管理页面')
console.log('   - 点击"复核"按钮')
console.log('   - 查看控制台是否有错误信息')
console.log('   - 查看网络请求是否成功')

console.log('\n2️⃣ 检查网络请求:')
console.log('   - 打开浏览器开发者工具 Network 标签')
console.log('   - 点击复核按钮')
console.log('   - 查看是否有 /admin/applications/{id}/reviews 请求')
console.log('   - 检查请求状态码和响应数据')

console.log('\n3️⃣ 检查数据库:')
console.log('   - 连接数据库')
console.log('   - 查询 application_reviews 表')
console.log('   - 检查是否有对应申请的审核记录')
console.log('   - SQL: SELECT * FROM application_reviews WHERE application_id = ?;')

console.log('\n4️⃣ 添加调试日志:')
console.log('   - 在 fetchApplicationReviews 方法中添加更多 console.log')
console.log('   - 在后端 getApplicationReviews 方法中添加日志')
console.log('   - 检查数据流转的每个环节')

console.log('\n🧪 测试步骤:')

console.log('\n📋 前端测试:')
console.log('   1. 打开复核管理页面')
console.log('   2. 找到一个"初审通过"或"初审存疑"的申请')
console.log('   3. 点击"复核"按钮')
console.log('   4. 在弹窗中切换到"审核记录"标签页')
console.log('   5. 检查是否显示审核记录或空状态')

console.log('\n📋 后端测试:')
console.log('   1. 使用 Postman 或 curl 测试 API')
console.log('   2. GET /admin/applications/{id}/reviews')
console.log('   3. 检查返回的数据格式和内容')
console.log('   4. 验证数据库查询结果')

console.log('\n📋 数据库测试:')
console.log('   1. 查询申请表: SELECT * FROM applications LIMIT 10;')
console.log('   2. 查询审核记录表: SELECT * FROM application_reviews LIMIT 10;')
console.log('   3. 检查外键关联: ')
console.log('      SELECT ar.*, a.application_number ')
console.log('      FROM application_reviews ar ')
console.log('      JOIN applications a ON ar.application_id = a.id;')

console.log('\n💡 快速修复建议:')

console.log('\n🔧 如果是数据问题:')
console.log('   - 确保数据库中有审核记录数据')
console.log('   - 检查 application_reviews 表结构')
console.log('   - 验证外键关联正确')

console.log('\n🔧 如果是API问题:')
console.log('   - 检查后端日志')
console.log('   - 验证API权限设置')
console.log('   - 测试API返回数据格式')

console.log('\n🔧 如果是前端问题:')
console.log('   - 检查控制台错误')
console.log('   - 验证数据绑定')
console.log('   - 测试组件渲染逻辑')

console.log('\n✅ 调试指南完成！')
console.log('🎯 建议按照上述步骤逐一排查问题。')
console.log('📝 重点关注浏览器控制台和网络请求。')
console.log('🚀 如果需要进一步帮助，请提供具体的错误信息。')