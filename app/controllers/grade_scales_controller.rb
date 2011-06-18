class GradeScalesController < ApplicationController
  # GET /grade_scales
  # GET /grade_scales.json
  def index
    @grade_scales = GradeScale.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @grade_scales }
    end
  end

  # GET /grade_scales/1
  # GET /grade_scales/1.json
  def show
    @grade_scale = GradeScale.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @grade_scale }
    end
  end

  # GET /grade_scales/new
  # GET /grade_scales/new.json
  def new
    @grade_scale = GradeScale.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @grade_scale }
    end
  end

  # GET /grade_scales/1/edit
  def edit
    @grade_scale = GradeScale.find(params[:id])
  end

  # POST /grade_scales
  # POST /grade_scales.json
  def create
    @grade_scale = GradeScale.new(params[:grade_scale])

    respond_to do |format|
      if @grade_scale.save
        format.html { redirect_to @grade_scale, notice: 'Grade scale was successfully created.' }
        format.json { render json: @grade_scale, status: :created, location: @grade_scale }
      else
        format.html { render action: "new" }
        format.json { render json: @grade_scale.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /grade_scales/1
  # PUT /grade_scales/1.json
  def update
    @grade_scale = GradeScale.find(params[:id])

    respond_to do |format|
      if @grade_scale.update_attributes(params[:grade_scale])
        format.html { redirect_to @grade_scale, notice: 'Grade scale was successfully updated.' }
        format.json { head :ok }
      else
        format.html { render action: "edit" }
        format.json { render json: @grade_scale.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /grade_scales/1
  # DELETE /grade_scales/1.json
  def destroy
    @grade_scale = GradeScale.find(params[:id])
    @grade_scale.destroy

    respond_to do |format|
      format.html { redirect_to grade_scales_url }
      format.json { head :ok }
    end
  end
end
