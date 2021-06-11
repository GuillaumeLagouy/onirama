const { Client } = require("@elastic/elasticsearch");
const functions = require("firebase-functions");

class ElasticsearchHelper {
	constructor() {
		this.client = this.initClient();
	}

	initClient() {
		const env = functions.config();
		const node = env.elasticsearch.url;
		const auth = {
			username: env.elasticsearch.username,
			password: env.elasticsearch.password,
		};

		return new Client({
			node: node,
			auth: auth,
		});
	}

	async request() {}

	async searchDream(userId, value) {
		const result = await this.client.search({
			index: "dream",
			body: {
				query: {
					bool: {
						must: [
							{
								query_string: {
									fields: ["text", "title"],
									query: `*${value}*`,
								},
							},
							{
								match: {
									userId: userId,
								},
							},
						],
					},
				},
			},
		});
		return result.body;
	}
	async getDreamsByDate() {
		const result = await this.client.search({
			index: "dream",
			body: {
				sort: {
					date: "desc",
				},
			},
		});
		return result.body;
	}

	async getDreamsByType(userId, emotionId) {
		const result = await this.client.search({
			index: "dream",
			body: {
				query: {
					bool: {
						must: [
							{ match: { emotionId: emotionId } },
							{ match: { userId: userId } },
						],
					},
				},
			},
		});
		return result.body;
	}

	async getEmotionCount(userId, emotionId) {
		const result = await this.client.count({
			index: "dream",
			body: {
				query: {
					bool: {
						must: [
							{
								nested: {
									path: "emotions",
									query: {
										bool: {
											must: [
												{
													match: {
														"emotions.emotionId": emotionId,
													},
												},
											],
										},
									},
								},
							},
							{
								match: {
									userId: userId,
								},
							},
						],
					},
				},
			},
		});
		return result.body.count;
	}

	async getEmotionByValue(userId, emotionId, subEmotionId) {
		const result = await this.client.search({
			index: "dream",
			body: {
				query: {
					bool: {
						must: [
							{
								nested: {
									path: "emotions",
									query: {
										bool: {
											must: [
												{
													match: {
														"emotions.emotionId": emotionId,
													},
												},
												{
													match: {
														"emotions.subEmotionId": subEmotionId,
													},
												},
											],
										},
									},
								},
							},
							{
								match: {
									userId: userId,
								},
							},
						],
					},
				},
			},
		});
		return result.body;
	}

	async getSubEmotionCount(userId, emotionId, subEmotionId) {
		const result = await this.client.count({
			index: "dream",
			body: {
				query: {
					bool: {
						must: [
							{
								nested: {
									path: "emotions",
									query: {
										bool: {
											must: [
												{
													match: {
														"emotions.emotionId": emotionId,
													},
												},
												{
													match: {
														"emotions.subEmotionId": subEmotionId,
													},
												},
											],
										},
									},
								},
							},
							{
								match: {
									userId: userId,
								},
							},
						],
					},
				},
			},
		});
		return result.body.count;
	}

	async createDreamIndex(snap, context) {
		await this.client.index({
			index: "dream",
			type: "_doc",
			id: context.params.dreamId,
			body: snap.data(),
		});
	}

	async updateDreamIndex(snap, context) {
		await this.client.update({
			index: "dream",
			id: context.params.dreamId,
			body: {
				doc: snap.after.data(),
			},
		});
	}

	async deleteDreamIndex(snap, context) {
		await this.client.delete({
			index: "dream",
			type: "_doc",
			id: context.params.dreamId,
		});
	}
}

exports.ElasticsearchHelper = ElasticsearchHelper;
