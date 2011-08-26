class GradeScalesController < ApplicationController
  # GET /grade_scales
  # GET /grade_scales.json
  def index
    @grade_scales = GradeScale.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render :json => @grade_scales }
    end
  end

  def scale
    @scale = GradeScale.where(:course_id => params[:course_id]).first
    respond_to do |format|
      format.html {render :layout => false}
    end
  end

  # GET /grade_scales/1
  # GET /grade_scales/1.json
  def show
    @scale = GradeScale.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render :json => @grade_scale }
    end
  end

  # GET /grade_scales/new
  # GET /grade_scales/new.json
  def new
    @grade_scale = GradeScale.new
    respond_to do |format|
      format.html # new.html.erb
      format.json { render :json => @grade_scale }
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
        format.json { render :json => @grade_scale, :status => :created, :location => @grade_scale }
      else
        format.json { render :json => @grade_scale.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /grade_scales/1
  # PUT /grade_scales/1.json
  def update
    @grade_scale = GradeScale.find(params[:id])
    respond_to do |format|
      if(params[:grade_scale][:scale_type] != "manual")
          @grade_scale.manual_grades.clear
      end
      if @grade_scale.update_attributes(params[:grade_scale])
        format.js
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

  def grade
    @grade_scale = GradeScale.find(params[:id])
    @student_id = params[:student_id].to_s
    _grade = params[:value]

    @grade_scale.manual_grades[@student_id] = _grade
    @grade_scale.save

    respond_to  do |format|
      format.html {render :text => ""}
    end
  end

end
